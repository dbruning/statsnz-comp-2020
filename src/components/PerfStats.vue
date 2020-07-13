<template>
    <div>
        <div v-if="usedMemory > 0">
            Memory: {{Math.round((usedMemory / 1024 / 1024)).toLocaleString()}}MB
        </div>
        FPS: {{Math.round(frameRate)}}
    </div>
</template>

<script>
  import appState from '@/components/AppState'


  export default {
    name: 'Controls',
    data() {
      return {
        usedMemory: 0,
        frameRate: 0,
      }
    },
    mounted() {
      let self = this;
      setInterval(function() {
        // Get memory numbers, if supported (essentially Chrome only)
        if (performance && performance.memory && performance.memory.usedJSHeapSize)
        self.usedMemory = performance.memory.usedJSHeapSize

        // Get FPS
        self.frameRate = appState.frameRate
      }, 500)
    },
  }
</script>

