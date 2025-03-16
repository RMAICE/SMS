/**
 * @param {string | number | Date} utcDate
 */
function convertToLocalDate(utcDate) {
  const date = new Date(utcDate)
  return date.toISOString().substring(0, 10)
}

const rows = document.querySelectorAll('#dateCell')
rows.forEach((row) => {
  const utcDate = row.textContent

  if (!utcDate) {
    row.textContent = 'N/A'
    return
  }

  row.textContent = convertToLocalDate(utcDate)
})
