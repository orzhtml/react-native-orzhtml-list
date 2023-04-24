import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OrzhtmlList, { OrzhtmlListHandles } from './app/list'

interface ItemData {
  name: number;
}

function App(): JSX.Element {
  const _flatList = useRef<OrzhtmlListHandles<ItemData>>(null)
  const page = useRef(0)
  const textIndex = useRef(0)

  useEffect(() => {
    fetchData()
  }, [])

  const mock = <T extends any>(
    data: T,
    t?: number
  ): Promise<T> => {
    return new Promise((resolve) => {
      t = t || Math.random() * 1500
      setTimeout(resolve, t, data)
    })
  }
  const getData = (start = 0, end = 10): ItemData[] => {
    let list = []
    for (let i = start; i < end; i++) {
      list.push({ name: i })
    }
    return list
  }

  const fetchData = async () => {
    const res = await mock(getData())
    console.log('fetchData res:', res);
    _flatList.current.addInitialData(res)
  }

  const _setRefresh = (startFetch, abortFetch) => {
    mock([]).then(res => {
      page.current = 0
      textIndex.current++
      startFetch(res)
    }).catch(e => {
      abortFetch()
    })
  }

  const _setEndReached = (startFetch) => {
    if (page.current === 1) {
      startFetch([])
      return false
    }
    mock(getData(10, 20)).then(res => {
      startFetch(res)
      page.current = 1
    })
  }

  function _renderItem({ item }: { item: ItemData }) {
    return (
      <View style={{ height: 100, borderBottomColor: '#000', borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, color: 'black' }}>{item.name}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <OrzhtmlList
        ref={_flatList}
        renderItem={_renderItem}
        setRefresh={_setRefresh}
        setEndReached={_setEndReached}
      />
    </SafeAreaView>
  );
}

export default App;
