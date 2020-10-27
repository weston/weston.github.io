function main() {
    console.log("hello")
    NewRangeSelector("left-column", "rs1")
    NewRangeSelector("right-column", "rs2")

    document.getElementById("slider").oninput = handleSliderChange
}


function appendBoard(button) {
    document.getElementById("board").value = document.getElementById(
        "board").value + button.value
}


function runAnalyis() {

}
