import Vue from 'vue'

var sharedState = {
    dataset: "",
    dataDetail: "med",
    graphicsDetail: "med",
    frameRate: 0,
    progressTask: "",
    progressPercent: 0,
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


