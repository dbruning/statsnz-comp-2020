<template>
    <div v-if="appState.highlightedRegionName.length">
        {{appState.highlightedRegionName}}:
        <table>
            <tr v-for="(movement, index) in withinMovements" :key="index">
                <td class="name">
                    {{movement.direction}} {{movement.name}}
                </td>
                <td class="count">
                    {{movement.count}}
                </td>
            </tr>
        </table>
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
      withinMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="within")
      },
      fromMovements: function() {
        return this.appState.highlightedRegionMovementData.slice().filter(m => m.direction=="from")
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

