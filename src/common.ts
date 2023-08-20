import React from 'react'
import { ColorValue, FlatListProps } from 'react-native'

export enum PageStatus {
    firstLoad = 0, // 第一次加载
    waiting = 1, // 等待加载
    inLoaded = 2, // 加载中
    allLoaded = 3, // 加载完成
    noData = 4, // 一个数据都没有
}

export interface ScrollToEndTypes { animated?: boolean | null }

export interface ScrollToIndexTypes { animated?: boolean | null, index: number, viewOffset?: number, viewPosition?: number }

export interface ScrollToItemTypes { animated?: boolean | null, item: any, viewOffset?: number, viewPosition?: number }

export interface ScrollToOffsetTypes { animated?: boolean | null, offset: number }

export interface RefreshableTypes {
    refreshable?: boolean,
    refreshableColors?: ColorValue[] | undefined;
    refreshableProgressBackgroundColor?: ColorValue | undefined;
    refreshableSize?: number | undefined;
    refreshableTintColor?: ColorValue | undefined;
    refreshableTitle?: string | undefined;
}

export interface RefreshingFuncTypes<T> {
    setRefreshing?: (refresh: boolean) => void,
    setRefresh?: (postRefresh: (rows: T[]) => void, endFetch: () => void) => void,
    setEndReached?: (postPaginate: (rows: T[]) => void) => void,
    isRefresh?: boolean,
}

export interface OrzhtmlListProps<T> extends Omit<FlatListProps<T>, 'data' | 'ListFooterComponent'>, RefreshableTypes, RefreshingFuncTypes<T> {
    // Pagination
    pagination?: boolean,
    allLoadedText?: string,
    // Pagination Button
    paginationBtnText?: string,
    emptyViewText?: string,
    // Spinner
    spinnerColor?: string,
    waitingSpinnerSize?: 'small' | 'large',
    waitingSpinnerText?: string,
    ListFooterComponent?: React.ReactElement,
    PaginationBtnView?: React.ReactElement,
    PaginationFetchingView?: React.ReactElement,
    PaginationAllLoadedView?: React.ReactElement,
    PaginationWaitingView?: React.ReactElement,
    EmptyView?: React.ReactElement,
    HeaderView?: React.ReactElement,
}

export interface OrzhtmlListHandles<T> {
    /** 手动刷新 */
    refreshListData: () => void,
    /** 第一次数据加载 */
    addInitialData: (rows: T[]) => void,
    /** 获取已存的所有数据 */
    getListRows: () => T[],
    /** 手动更新数据 */
    updateDataSource: (rows: T[]) => void,
    onRefreshing: (r: boolean) => void,
    scrollToEnd: (params: ScrollToEndTypes) => void,
    scrollToIndex: (params: ScrollToIndexTypes) => void,
    scrollToItem: (params: ScrollToItemTypes) => void,
    scrollToOffset: (params: ScrollToOffsetTypes) => void,
}

export type OrzhtmlListViewProps<T> = OrzhtmlListProps<T> & {
    refInstance: React.ForwardedRef<OrzhtmlListHandles<T>>
}
