import Vue from 'vue'

var sharedState = {
    dataset: "study",
    dataDetail: "med",
    transportMode: "Total",
    graphicsDetail: "med",
    frameRate: 0,
    progressTask: "",
    progressPercent: 0,
    canLoad: false,
    hasLoadedVisualisation: false,
    isLoadingVisualisation: false,
    highlightedRegionName: "",
    highlightedRegionMovementData: []
}

var tmpVm = new Vue({ data : { sharedState} });
sharedState = tmpVm.sharedState;

// // export default Vue.observable({
// export default Vue.observable({
//     dataset: "work"
// })

export default sharedState


