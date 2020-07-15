<template>
    <div v-if="appState.highlightedRegionName.length" class="region-detail">
        {{appState.highlightedRegionName}}:
        <table class="table-condensed">
            <tr v-for="(movement, index) in withinMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
        <table class="table-condensed">
            <tr v-for="(movement, index) in fromMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
        <table class="table-condensed">
            <tr v-for="(movement, index) in toMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
        <a href="#" @click="removeHighlight">remove highlight</a>
        <!--{{appState.highlightedRegionMovementData}}-->
        <!--{{sortedMovements}}-->

    </div>
</template>

<script>
  import appState from '@/components/AppState'

  function byCount(a, b) {
    return b.count - a.count
  }

  export default {
    name: 'Controls',
    data() {
      return {
        appState: appState,
      }
    },
    created() {
    },
    methods: {
      removeHighlight() {
        this.$root.$emit('removeHighlight')
      }
    },
    computed: {
      withinMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="within").sort(byCount)
      },
      fromMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="from").sort(byCount)
      },
      toMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="to").sort(byCount)
      }
    },
    mounted() {
      let self = this;
      // this.$root.$on('regionClicked', function(data) {
      //   self.regionName = data.SA22018__1
      //   console.log("Region clicked:", data)
      //
      // })
    },
  }
</script>

<style scoped>
    .region-detail {
        margin-top: 1em;
    }

    table {
        margin: 0.5em;
        width: 100%;
    }
    td.name {
        text-align: left;
    }
    td.count {
        text-align: right;
    }
</style>

