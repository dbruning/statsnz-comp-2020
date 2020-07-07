import Vue from 'vue'

var sharedState = {
    dataset: "work",
    detail: "coarse"
}

var tmpVm = new Vue({ data : { sharedState} });
sharedState = tmpVm.sharedState;

// // export default Vue.observable({
// export default Vue.observable({
//     dataset: "work"
// })

export default sharedState


