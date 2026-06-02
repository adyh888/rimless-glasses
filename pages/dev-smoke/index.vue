<template>
  <view class="container">
    <view class="title">qtsj-cloud 联调冒烟</view>
    <view class="hint">在 HBuilderX 里把 dev-seed / products / articles 上传到本地云函数后，按顺序点击按钮即可。</view>

    <button class="btn" @click="run('seed')" :disabled="loading">1. seed 写入测试数据</button>
    <button class="btn" @click="run('verify')" :disabled="loading">2. verify 计数</button>
    <button class="btn" @click="run('products')" :disabled="loading">3. products.list</button>
    <button class="btn" @click="run('articles')" :disabled="loading">4. articles.list</button>
    <button class="btn btn-danger" @click="run('clean')" :disabled="loading">清理种子</button>

    <view class="status" v-if="status">{{ status }}</view>
    <view class="result" v-if="result">
      <view class="result-title">{{ resultLabel }}</view>
      <text class="result-text">{{ resultText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const status = ref('')
const result = ref(null)
const resultLabel = ref('')

const resultText = ref('')

async function run (action) {
  loading.value = true
  status.value = `正在调用 ${action}...`
  result.value = null
  try {
    let data
    switch (action) {
      case 'seed': {
        const co = uniCloud.importObject('dev-seed')
        data = await co.seed()
        resultLabel.value = 'dev-seed.seed()'
        break
      }
      case 'verify': {
        const co = uniCloud.importObject('dev-seed')
        data = await co.verify()
        resultLabel.value = 'dev-seed.verify()'
        break
      }
      case 'products': {
        const co = uniCloud.importObject('products')
        data = await co.list({ page: 1, limit: 5 })
        resultLabel.value = 'products.list({ page:1, limit:5 })'
        break
      }
      case 'articles': {
        const co = uniCloud.importObject('articles')
        data = await co.list({ page: 1, limit: 5 })
        resultLabel.value = 'articles.list({ page:1, limit:5 })'
        break
      }
      case 'clean': {
        const co = uniCloud.importObject('dev-seed')
        data = await co.clean()
        resultLabel.value = 'dev-seed.clean()'
        break
      }
    }
    status.value = `✅ ${action} 成功`
    result.value = data
    resultText.value = JSON.stringify(data, null, 2)
  } catch (e) {
    status.value = `❌ ${action} 失败：${e?.errMsg || e?.message || e}`
    result.value = e
    resultText.value = JSON.stringify(e, null, 2)
  } finally {
    loading.value = false
  }
}
</script>

<style>
.container {
  padding: 32rpx;
  font-size: 28rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}
.hint {
  color: #888;
  margin-bottom: 24rpx;
  line-height: 1.5;
}
.btn {
  margin-bottom: 16rpx;
  background: #2563eb;
  color: #fff;
}
.btn-danger {
  background: #dc2626;
}
.status {
  padding: 16rpx;
  margin: 24rpx 0;
  background: #f3f4f6;
  border-radius: 8rpx;
}
.result {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #111827;
  color: #d1fae5;
  border-radius: 8rpx;
}
.result-title {
  color: #9ca3af;
  margin-bottom: 8rpx;
  font-size: 24rpx;
}
.result-text {
  font-family: ui-monospace, monospace;
  font-size: 24rpx;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
