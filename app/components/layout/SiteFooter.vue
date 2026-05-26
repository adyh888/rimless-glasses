<template>
  <footer class="bg-primary text-white/70">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="md:col-span-1">
          <div class="text-2xl font-light tracking-wider text-white mb-4">
            清透<span class="text-accent">视界</span>
          </div>
          <p class="text-sm leading-relaxed">
            以极简设计重新定义视觉体验<br />让框架消失，让世界更清晰
          </p>
        </div>

        <div>
          <h4 class="text-white text-sm font-medium mb-4 tracking-wide">产品系列</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/products" class="hover:text-white transition-colors">经典系列</NuxtLink></li>
            <li><NuxtLink to="/products" class="hover:text-white transition-colors">商务系列</NuxtLink></li>
            <li><NuxtLink to="/products" class="hover:text-white transition-colors">运动系列</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white text-sm font-medium mb-4 tracking-wide">关于品牌</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/about" class="hover:text-white transition-colors">品牌故事</NuxtLink></li>
            <li><NuxtLink to="/news" class="hover:text-white transition-colors">新闻动态</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-white transition-colors">联系我们</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white text-sm font-medium mb-4 tracking-wide">联系方式</h4>
          <ul class="space-y-2 text-sm">
            <li>电话：400-888-0000</li>
            <li>邮箱：hello@qingtou.com</li>
            <li>地址：深圳市南山区科技园</li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>&copy; {{ new Date().getFullYear() }} 清透视界 QINGTOU VISION. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-white/60 transition-colors">隐私政策</a>
          <a href="#" class="hover:text-white/60 transition-colors">使用条款</a>
        </div>
      </div>
    </div>
  </footer>
</template>
