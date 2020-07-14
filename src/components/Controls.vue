<template>
    <div>
        <h3>CommuterView</h3>
        <h5>2018 Census data</h5>

        <div v-show="!appState.isLoadingVisualisation">

            <b-form-group label="Dataset:">
                <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                    <b-form-radio v-model="dataset" name="dataset" value="work">Work</b-form-radio>
                    <b-form-radio v-model="dataset" name="dataset" value="study">Study</b-form-radio>
                </b-form-radio-group>
            </b-form-group>

            <b-form-group label="Data detail:">
                <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                    <b-form-radio v-model="dataDetail" name="dataset" value="low">Low</b-form-radio>
                    <b-form-radio v-model="dataDetail" name="dataset" value="med">Med</b-form-radio>
                    <b-form-radio v-model="dataDetail" name="dataset" value="high">High</b-form-radio>
                </b-form-radio-group>
            </b-form-group>

            <b-form-group label="Mode of transport:">
                <b-form-select v-model="transportMode" class="mb-3" plain v-if="dataset=='work'">
                    <!--<b-form-select-option :value="null">Please select an option</b-form-select-option>-->
                    <b-form-select-option value="Work_at_home">Work at home</b-form-select-option>
                    <b-form-select-option value="Drive_a_private_car_truck_or_van">Drive private car/truck/van
                    </b-form-select-option>
                    <b-form-select-option value="Drive_a_company_car_truck_or_van">Drive company car/truck/van
                    </b-form-select-option>
                    <b-form-select-option value="Passenger_in_a_car_truck_van_or_company_bus">Passenger in
                        car/truck/van/co.bus
                    </b-form-select-option>
                    <b-form-select-option value="Public_bus">Public bus</b-form-select-option>
                    <b-form-select-option value="Train">Train</b-form-select-option>
                    <b-form-select-option value="Bicycle">Bicycle</b-form-select-option>
                    <b-form-select-option value="Walk_or_jog">Walk or jog</b-form-select-option>
                    <b-form-select-option value="Ferry">Ferry</b-form-select-option>
                    <b-form-select-option value="Total">(Any)</b-form-select-option>
                </b-form-select>

                <b-form-select v-model="transportMode" class="mb-3" plain v-if="dataset=='study'">
                    <!--<b-form-select-option :value="null">Please select an option</b-form-select-option>-->
                    <b-form-select-option value="Work_at_home">Study at home</b-form-select-option>
                    <b-form-select-option value="Drive_a_car_truck_or_van">Drive a car/truck/van</b-form-select-option>
                    <b-form-select-option value="Drive_a_company_car_truck_or_van">Drive company car/truck/van
                    </b-form-select-option>
                    <b-form-select-option value="Passenger_in_a_car_truck_or_van">Passenger in car/truck/van
                    </b-form-select-option>
                    <b-form-select-option value="Public_bus">Public bus</b-form-select-option>
                    <b-form-select-option value="Train">Train</b-form-select-option>
                    <b-form-select-option value="Bicycle">Bicycle</b-form-select-option>
                    <b-form-select-option value="Walk_or_jog">Walk or jog</b-form-select-option>
                    <b-form-select-option value="Ferry">Ferry</b-form-select-option>
                    <b-form-select-option value="Total">(Any)</b-form-select-option>
                </b-form-select>
            </b-form-group>

            <b-btn variant="primary" class="load-button" @click="loadClicked"
                   v-if="canLoad && !appState.isLoadingVisualisation">Load
            </b-btn>
        </div>

        <div class="progress-line" v-if="appState.progressTask.length">
            <div>{{appState.progressTask}}</div>
            <div>{{Math.ceil(appState.progressPercent) }}%</div>
        </div>

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
        dataset: null,
        dataDetail: null,
        transportMode: null
      }
    },
    created() {
    },
    methods: {
      loadClicked() {
        // Copy the settings into the app state
        this.appState.dataset = this.dataset
        this.appState.dataDetail = this.dataDetail
        this.appState.transportMode = this.transportMode
        this.$root.$emit('load')
      }
    },
    computed: {
      canLoad: function () {
        // If user hasn't specified dataset or dataDetail level, we can't load yet
        if (this.dataset == null || this.dataDetail == null || this.transportMode == null) {
          return false;
        }

        // If we're currently loading, then we can't load
        if (this.appState.isLoadingVisualisation) {
          return false
        }

        // // If we haven't yet loaded, and we're otherwise OK, then we can load
        if (!this.appState.hasLoadedVisualisation && !this.appState.isLoadingVisualisation) {
          return true;
        }

        // Otherwise, we can load IF the current settings are different to the ones we loaded.
        if (this.appState.dataset != this.dataset
          || this.appState.dataDetail != this.dataDetail
          || this.appState.transportMode != this.transportMode
        ) {
          return true
        }

        return false;
      }
    },
    mounted() {
      let self = this;
      this.dataset = this.appState.dataset
      this.dataDetail = this.appState.dataDetail
      this.transportMode = this.appState.transportMode
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

    select.form-control {
        background-color: black;
        color: #42b983;
        border-color: #42b983;

    }
</style>

