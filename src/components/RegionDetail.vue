<template>
    <div v-if="appState.highlightedRegionName.length">
        {{appState.highlightedRegionName}}:
        <table>
            <tr v-for="(movement, index) in fromMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
        <table>
            <tr v-for="(movement, index) in toMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
        <!--{{appState.highlightedRegionMovementData}}-->
        <!--{{sortedMovements}}-->

    </div>
</template>

<script>
  import appState from '@/components/AppState'

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
      // loadClicked() {
      //   this.$root.$emit('load')
      // }
    },
    computed: {
      sortedMovements: function() {
        return this.appState.highlightedRegionMovementData
          // Avoid side effect
          .slice()
          .sort((a, b) => {
            let countDiff = (a.count - b.count)
            if (a.direction == "from" && b.direction == "to") return -2
            if (a.direction == "to" && b.direction == "from") return 2
            if (a.count > b.count) return -1
            if (a.count < b.count) return 1
            return 0
          })
      },
      fromMovements: function() {
        return this.appState.highlightedRegionMovementData
          .slice()
          .filter(m => m.direction=="from")
        // .sort((a, b) => b.count - a.count)
      },
      toMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="to")
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

