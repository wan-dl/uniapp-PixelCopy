# app-performance-memory

此UTS插件用于在App里，获取当前App所占用的内存。

```vue
<template>
    <view>
        <button @click='getData()'>获取app内存</button>
        
        <view>App使用内存：{{ memoryData.TotalPss }} MB</view>
    </view>
</template>

<script setup lang="uts">
    import { getAppMemory } from '@/uni_modules/app-performance';
    
    type Obj = {
        TotalPss: string;
        TotalPrivateDirty: string;
        TotalSharedDirty: string;
    };
    let memoryData = ref<Obj>({
        TotalPss: '0',
        TotalPrivateDirty: '',
        TotalSharedDirty: ''
    });

    function getData() {
        let data: any = getAppMemory();
        console.log("-->", data );
        memoryData.value.TotalPss = (data as UTSJSONObject)["TotalPss"] as String;
    };
</script>
```