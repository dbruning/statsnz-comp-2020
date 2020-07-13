<template>
    <div>
        <h3>Controls</h3>
        <!--<b-form-group label="Dataset: ">-->
        <b-form-group>
            <b-form-radio-group >
                <b-form-radio v-model="appState.dataset" name="dataset" value="work">Work</b-form-radio>
                <b-form-radio v-model="appState.dataset" name="dataset" value="study">Study</b-form-radio>
            </b-form-radio-group>
        <b-btn @click="loadClicked">Load</b-btn>
        </b-form-group>

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
        selectedDataset: "",
        appState: appState,
        usedMemory: 0,
        frameRate: 0,
      }
    },
    static() {
      return {
      }
    },
    created() {
    },
    methods: {
      loadClicked() {
        this.$root.$emit('load')
      }
    },
    mounted() {
      let self = this;
      setInterval(function() {
        // Get memory numbers, if supported (essentially Chrome only)
        if (performance && performance.memory && performance.memory.usedJSHeapSize)
        self.usedMemory = performance.memory.usedJSHeapSize

        // Get FPS
        self.frameRate = self.appState.frameRate
      }, 500)
    },
  }
</script>

