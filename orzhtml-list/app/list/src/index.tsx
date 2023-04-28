import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FlatList, Text, View, ActivityIndicator, RefreshControl } from 'react-native'

import { OrzhtmlListHandles, OrzhtmlListProps, OrzhtmlListViewProps, PageStatus, ScrollToEndTypes, ScrollToIndexTypes, ScrollToItemTypes, ScrollToOffsetTypes } from './common'
import styles from './OrzhtmlListViewStyle'

function OrzhtmlListView<T>(props: OrzhtmlListViewProps<T>) {
  // 初始化 dataSource 状态
  const [dataSource, setDataSource] = useState<T[]>([])
  // 初始化 isRefreshing 状态
  const [isRefreshing, setIsRefreshing] = useState(false)
  // 初始化 pageStatus 状态
  const [pageStatus, setPageStatus] = useState(PageStatus.firstLoad)
  // 定义 mountedRef 为一个 ref，初始值为 false
  const mountedRef = useRef(false)
  // 定义 flatListRef 为一个 ref，初始值为 null
  const flatListRef = useRef<FlatList<T>>(null)
  // 定义 flatListRef 为一个 ref，初始值为 null
  const rowsRef = useRef<T[]>([])
  // 定义 refreshingRef 为一个 ref，初始值为 false
  const refreshingRef = useRef(false)
  // 定义 isLoadingMoreRef 为一个 ref，初始值为 false
  const isLoadingMoreRef = useRef(false)

  useEffect(() => {
    // 将 mountedRef 的值设为 true
    mountedRef.current = true
    // 返回一个函数，该函数会在组件卸载时执行，将 mountedRef 的值设为 false
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 定义 onRefreshHandler 函数，使用 useCallback 进行优化，避免不必要的函数创建
  const onRefreshHandler = useCallback(() => {
    // 如果组件已挂载且 props 中有 setRefresh 方法
    if (mountedRef.current && props.setRefresh) {
      // 调用 props 中的 setRefreshing 方法并传入 true
      props.setRefreshing?.(true);
      // 将 refreshingRef 的值设为 true
      refreshingRef.current = true;
      // 将 isRefreshing 的值设为 true
      setIsRefreshing(true);
      // 调用 props 中的 setRefresh 方法，并传入 handleRefresh 和 completeDataFetch 方法
      props.setRefresh(handleRefresh, completeDataFetch);
    }
  }, [props.setRefreshing, props.setRefresh]);

  // 定义 loadMoreData 函数，使用 useCallback 进行优化，避免不必要的函数创建
  const loadMoreData = useCallback(() => {
    // 如果正在刷新，直接返回 false
    if (refreshingRef.current) return false
    // 如果 props 中有 pagination 属性且 pageStatus 的值为 PageStatus.firstLoad 或 PageStatus.waiting
    if (props.pagination && (pageStatus === PageStatus.firstLoad || pageStatus === PageStatus.waiting)) {
      // 调用 fetchMoreData 方法
      fetchMoreData()
    }
  }, [pageStatus, props.pagination, props.setEndReached])

  // 定义 onRefresh 函数，使用 useCallback 进行优化，避免不必要的函数创建
  const onRefresh = useCallback(() => {
    onRefreshHandler();
  }, [onRefreshHandler]);

  // 定义 onEndReached 函数，使用 useCallback 进行优化，避免不必要的函数创建
  const onEndReached = useCallback(() => {
    loadMoreData();
  }, [loadMoreData]);

  // 定义 handleRefresh 函数，使用 useCallback 进行优化，避免不必要的函数创建
  const handleRefresh = useCallback((rows: T[] = []) => {
    let mergedRows: T[] = [];
    let pageStatus = PageStatus.waiting;
    let isRefresh = false;
    // 如果组件已挂载，执行下面的逻辑
    if (mountedRef.current) {
      // 如果 props.isRefresh 为 true，说明是下拉刷新，直接使用传入的数据作为新数据
      if (props.isRefresh) {
        mergedRows = rows
        isRefresh = true
      } else {
        // 否则将新数据合并到已有数据的后面
        mergedRows = rows.concat(getListRows())
      }
      // 根据新数据的数量和组件的 initialNumToRender 属性，设置组件的状态
      if (rows.length > 0 && rows.length < props.initialNumToRender!) {
        pageStatus = PageStatus.allLoaded
      } else if (rows.length === 0) {
        pageStatus = PageStatus.noData
      }
      // 更新组件的数据状态
      updateListData({
        rows: mergedRows,
        pageStatus,
        isRefresh
      })
    }
  }, [props.isRefresh, props.initialNumToRender])

  // 定义 fetchMoreData 函数，用于加载更多数据
  const fetchMoreData = () => {
    // 如果当前页面已经全部加载完成，直接返回
    if (pageStatus !== PageStatus.allLoaded) {
      // 如果正在加载更多数据，直接返回
      if (isLoadingMoreRef.current) {
        return false
      }
      isLoadingMoreRef.current = true
      setPageStatus(PageStatus.inLoaded)
      // 调用 props.setEndReached 函数，开始加载更多数据
      props.setEndReached?.(handlePagination)
    }
  }

  // 定义 handlePagination 函数，用于处理分页请求结果
  const handlePagination = (rows: T[] = []) => {
    let mergedRows: T[] = []
    let _pageStatus
    if (rows.length === 0) {
      _pageStatus = PageStatus.allLoaded
    } else {
      mergedRows = getListRows().concat(rows)
      _pageStatus = rows.length < props.initialNumToRender! ? PageStatus.allLoaded : PageStatus.waiting
    }
    isLoadingMoreRef.current = false
    // 更新列表数据及分页状态
    updateListData({
      rows: mergedRows,
      pageStatus: _pageStatus
    })
  }

  // 定义 updateListData 函数，用于更新列表数据及分页状态
  const updateListData = ({ rows, pageStatus, isRefresh }: {
    rows: T[]
    pageStatus: number,
    isRefresh?: boolean
  }) => {
    let mergedRows = rows

    if (rows.length) {
      // 更新列表行数据
      updateListRows(rows)
    } else {
      mergedRows = isRefresh ? rows : getListRows().slice()
    }
    // 设置数据源、分页状态，并完成数据获取操作
    setDataSource(mergedRows)
    setPageStatus(pageStatus)
    completeDataFetch()
  }

  // 定义 updateListRows 函数，用于更新列表行数据
  const updateListRows = (data: T[]) => {
    rowsRef.current = data
  }

  /** 获取已存的所有数据 */
  const getListRows = () => rowsRef.current

  // 用于完成数据获取的清理工作
  const completeDataFetch = () => {
    if (mountedRef.current) {
      props.setRefreshing?.(false)
      setIsRefreshing(false)
      onRefreshing(false)
    }
  }

  /** 第一次数据加载 */
  const addInitialData = (rows: T[] = []) => {
    updateDataSource(rows)
    completeDataFetch()
  }

  /** 手动更新数据 */
  const updateDataSource = (rows: T[] = []) => {
    let _pageStatus = PageStatus.waiting
    if (rows.length === 0) {
      _pageStatus = PageStatus.noData
    } else if (rows.length < props.initialNumToRender!) {
      _pageStatus = PageStatus.allLoaded
    }

    updateListRows(rows)
    setDataSource(rows)
    setPageStatus(_pageStatus)
  }

  /** 手动刷新 */
  const refreshListData = () => {
    if (mountedRef.current) {
      props.setRefreshing?.(true)
      setIsRefreshing(true)
      onRefreshing(true)
      setDataSource([])
      props.setRefresh?.(handleRefresh, completeDataFetch)
    }
  }

  // Updates the value of the `refreshingRef` with a boolean value
  const onRefreshing = (r: boolean) => {
    refreshingRef.current = r
  }

  // Scrolls to the end of the list view using the `flatListRef`
  const scrollToEnd = (params: ScrollToEndTypes) => {
    flatListRef.current?.scrollToEnd(params)
  }

  // Scrolls to the item at the specified index in the list view using the `flatListRef`
  const scrollToIndex = (params: ScrollToIndexTypes) => {
    flatListRef.current?.scrollToIndex(params)
  }

  // Scrolls to the item with the specified `key` and `index` in the list view using the `flatListRef`
  const scrollToItem = (params: ScrollToItemTypes) => {
    flatListRef.current?.scrollToItem(params)
  }

  // Scrolls to the specified content offset in the list view using the `flatListRef`
  const scrollToOffset = (params: ScrollToOffsetTypes) => {
    flatListRef.current?.scrollToOffset(params)
  }

  useImperativeHandle(props.refInstance, () => ({
    refreshListData,
    addInitialData,
    getListRows,
    updateDataSource,
    scrollToEnd: (params: ScrollToEndTypes) => {
      scrollToEnd(params)
    },
    scrollToIndex: (params: ScrollToIndexTypes) => {
      scrollToIndex(params)
    },
    scrollToItem: (params: ScrollToItemTypes) => {
      scrollToItem(params)
    },
    scrollToOffset: (params: ScrollToOffsetTypes) => {
      scrollToOffset(params)
    }
  }), [
    refreshListData, addInitialData, getListRows, updateDataSource,
    scrollToEnd, scrollToIndex, scrollToItem, scrollToOffset
  ])

  const _RenderRefreshControl = useCallback(() => {
    if (!props.refreshable) return undefined
    return (
      <RefreshControl
        colors={props.refreshableColors}
        onRefresh={onRefresh}
        progressBackgroundColor={props.refreshableProgressBackgroundColor}
        refreshing={isRefreshing}
        size={props.refreshableSize}
        tintColor={props.refreshableTintColor}
        title={props.refreshableTitle}
      />
    )
  }, [
    isRefreshing, props.refreshable, props.refreshableColors,
    props.refreshableProgressBackgroundColor, props.refreshableSize,
    props.refreshableTintColor, props.refreshableTitle
  ])

  const _ListFooterComponent = useCallback(() => {
    if (!props.pagination) {
      return null
    }
    if (pageStatus === PageStatus.waiting) {
      /** 等待上拉加载 */
      return PaginationBtnView()
    }
    if (pageStatus === PageStatus.inLoaded) {
      if (props.initialNumToRender && props.initialNumToRender > 0) {
        if (getListRows().length < props.initialNumToRender) {
          return PaginationAllLoadedView()
        }
      }
      /** 上拉加载中 */
      return PaginationWaitingView()
    }
    if (
      /** 上拉加载完成 / 没有更多数据 */
      getListRows().length !== 0 && pageStatus === PageStatus.allLoaded
    ) {
      return PaginationAllLoadedView()
    }
    // 再次加载数据为空
    if (pageStatus === PageStatus.noData) {
      return _ListEmptyComponent()
    }
    return null
  }, [pageStatus, props.pagination, props.initialNumToRender])

  const _ListEmptyComponent = useCallback(() => {
    if (pageStatus !== PageStatus.noData) {
      return null
    }
    if (props.EmptyView) {
      return props.EmptyView
    }
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyViewTxt}>{props.emptyViewText}</Text>
      </View>
    )
  }, [pageStatus, props.emptyViewText])

  /** 上拉加载完成，没有更多数据 */
  const PaginationAllLoadedView = useCallback(() => {
    if (props.PaginationAllLoadedView) {
      return props.PaginationAllLoadedView
    }
    return (
      <View style={styles.paginationView}>
        <Text style={styles.allLoadedText}>{props.allLoadedText}</Text>
      </View>
    )
  }, [props.allLoadedText])

  /** 上拉加载中 */
  const PaginationWaitingView = useCallback(() => {
    if (props.PaginationWaitingView) {
      return props.PaginationWaitingView
    }
    return (
      <View style={styles.paginationView}>
        <ActivityIndicator color={props.spinnerColor} size={props.waitingSpinnerSize} />
        <Text style={[styles.paginationViewText, styles.ml5]}>
          {props.waitingSpinnerText}
        </Text>
      </View>
    )
  }, [props.spinnerColor, props.waitingSpinnerSize, props.waitingSpinnerText])

  /** 上拉等待加载 */
  const PaginationBtnView = useCallback(() => {
    if (props.PaginationBtnView) {
      return props.PaginationBtnView
    }
    return (
      <View style={styles.fetchingView}>
        <Text style={styles.paginationViewText}>{props.paginationBtnText}</Text>
      </View>
    )
  }, [props.paginationBtnText])

  return (
    <FlatList
      ListFooterComponent={_ListFooterComponent}
      ListEmptyComponent={null}
      {...props}
      ref={flatListRef}
      data={dataSource}
      refreshing={isRefreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={_RenderRefreshControl()}
    />
  )
}

function OrzhtmlList<T>(props: OrzhtmlListProps<T>, ref: React.ForwardedRef<OrzhtmlListHandles<T>>) {
  const defaultProps: OrzhtmlListProps<T> = {
    initialNumToRender: 10,
    renderItem: () => null,
    isRefresh: true,
    refreshable: true,
    refreshableColors: ['dimgray', 'tomato', 'limegreen'],
    refreshableProgressBackgroundColor: '#fff',
    refreshableTintColor: 'lightgray',
    pagination: true,
    allLoadedText: 'End of List',
    waitingSpinnerSize: 'small',
    waitingSpinnerText: 'Loading...',
    paginationBtnText: 'Load more...',
    emptyViewText: 'Sorry no data',
  };
  const mergedProps = { ...defaultProps, ...props };
  return <OrzhtmlListView {...mergedProps} refInstance={ref} />;
}

export default forwardRef(OrzhtmlList) as <T>(
  props: OrzhtmlListProps<T> & { ref?: React.ForwardedRef<OrzhtmlListHandles<T>> }
) => ReturnType<typeof OrzhtmlList>;
