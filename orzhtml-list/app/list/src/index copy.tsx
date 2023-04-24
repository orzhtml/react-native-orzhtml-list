import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FlatList, Text, View, ActivityIndicator, RefreshControl } from 'react-native'

import { OrzhtmlListHandles, OrzhtmlListProps, OrzhtmlListViewProps, PageStatus } from './common'

function OrzhtmlListView<T>(props: OrzhtmlListViewProps<T>) {
  const [dataSource, setDataSource] = useState<T[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pageStatus, setPageStatus] = useState(PageStatus.firstLoad)
  const mountedRef = useRef(false)
  const flatListRef = useRef<FlatList<T>>(null)
  const rowsRef = useRef<T[]>([])
  const refreshingRef = useRef(false)
  const isLoadingMoreRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const onRefreshHandler = useCallback(() => {
    if (mountedRef.current && props.setRefresh) {
      props.setRefreshing?.(true);
      refreshingRef.current = true;
      setIsRefreshing(true);
      props.setRefresh(handleRefresh, completeDataFetch);
    }
  }, [props.setRefreshing, props.setRefresh]);

  const loadMoreData = useCallback(() => {
    if (refreshingRef.current) return false
    if (props.pagination && (pageStatus === PageStatus.firstLoad || pageStatus === PageStatus.waiting)) {
      fetchMoreData()
    }
  }, [pageStatus, props.pagination, props.setEndReached])

  const onRefresh = useCallback(() => {
    onRefreshHandler();
  }, [onRefreshHandler]);

  const onEndReached = useCallback(() => {
    loadMoreData();
  }, [loadMoreData]);

  const handleRefresh = useCallback((rows: T[] = []) => {
    let mergedRows: T[] = [];
    let pageStatus = PageStatus.waiting;
    let isRefresh = false;

    if (mountedRef.current) {
      if (props.isRefresh) {
        mergedRows = rows
        isRefresh = true
      } else {
        mergedRows = rows.concat(getListRows())
      }
      if (rows.length > 0 && rows.length < props.initialNumToRender!) {
        pageStatus = PageStatus.allLoaded
      } else if (rows.length === 0) {
        pageStatus = PageStatus.noData
      }
      updateListData({
        rows: mergedRows,
        pageStatus,
        isRefresh
      })
    }
  }, [props.isRefresh, props.initialNumToRender])

  const fetchMoreData = () => {
    if (pageStatus !== PageStatus.allLoaded) {
      if (isLoadingMoreRef.current) {
        return false
      }
      isLoadingMoreRef.current = true
      setPageStatus(PageStatus.inLoaded)
      props.setEndReached?.(handlePagination)
    }
  }

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
    updateListData({
      rows: mergedRows,
      pageStatus: _pageStatus
    })
  }

  const updateListData = ({ rows, pageStatus, isRefresh }: {
    rows: T[]
    pageStatus: number,
    isRefresh?: boolean
  }) => {
    let mergedRows = rows

    if (rows.length) {
      updateListRows(rows)
    } else {
      mergedRows = isRefresh ? rows : getListRows().slice()
    }

    setDataSource(mergedRows)
    setPageStatus(pageStatus)
    completeDataFetch()
  }

  const updateListRows = (data: T[]) => {
    rowsRef.current = data
  }

  const getListRows = () => rowsRef.current

  const completeDataFetch = () => {
    if (mountedRef.current) {
      props.setRefreshing?.(false)
      setIsRefreshing(false)
      onRefreshing(false)
    }
  }

  const addInitialData = (rows: T[] = []) => {
    updateDataSource(rows)
    completeDataFetch()
  }

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

  const refreshListData = () => {
    props.setRefreshing?.(true)
    setIsRefreshing(true)
    onRefreshing(true)
    setDataSource([])
    props.onRefresh?.()
  }

  const onRefreshing = (r: boolean) => {
    refreshingRef.current = r
  }

  const renderFooter = () => {
    if (pageStatus === PageStatus.waiting || pageStatus === PageStatus.inLoaded) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}>
          <ActivityIndicator animating size="small" />
        </View>
      )
    } else if (pageStatus === PageStatus.noData) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}>
          <Text>No data available</Text>
        </View>
      )
    } else {
      return null
    }
  }

  useImperativeHandle(props.refInstance, () => ({
    refreshListData,
    addInitialData,
    getListRows,
  }), [refreshListData, addInitialData, getListRows])

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
  }, [isRefreshing])

  return (
    <FlatList
      {...props}
      ref={flatListRef}
      data={dataSource}
      refreshing={isRefreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={_RenderRefreshControl()}
    />
  )
}

function OrzhtmlList<T>(props: OrzhtmlListProps<T>, ref: React.ForwardedRef<OrzhtmlListHandles<T>>) {
  const defaultProps: OrzhtmlListProps<T> = {
    initialNumToRender: 10,
    renderItem: () => null,
    refreshable: true,
    isRefresh: true,
    pagination: true,
  };
  const mergedProps = { ...defaultProps, ...props };
  return <OrzhtmlListView {...mergedProps} refInstance={ref} />;
}

export default forwardRef(OrzhtmlList) as <T>(
  props: OrzhtmlListProps<T> & { ref?: React.ForwardedRef<OrzhtmlListHandles<T>> }
) => ReturnType<typeof OrzhtmlList>;
