<template>
    <div>
        {{regionName}}

    </div>
</template>

<script>
  import appState from '@/components/AppState'

  // appState.progressTask = "testing"
  // appState.progressPercent= 5


  export default {
    name: 'Controls',
    data() {
      return {
        appState: appState,
        regionName: ""
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
      this.$root.$on('regionClicked', function(data) {
        self.regionName = data.SA22018__1
        console.log("Region clicked:", data)

      })
    },
  }
</script>

<style>
    .load-button, .full-width {
        width: 100%;
    }
    .progress-line {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>

