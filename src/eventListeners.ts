function expandSelectionToWordBoundaries(selection: Selection) {
  
}
export function attachSelectionListener(SSMLWorkDiv: any) {
  const { elt } = SSMLWorkDiv
  elt.addEventListener("selectstart", handleSelectionChange)
  
  function handleSelectionChange() {
    elt.addEventListener("mouseup", retrieveSelection)
    elt.addEventListener("keyup", retrieveSelection)
  }
  
  function retrieveSelection() {
    const sel = document.getSelection()
    console.log (sel instanceof Selection)
  }
}