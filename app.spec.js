const days = [6, 0, 1, 2, 3, 4, 5]
/**
 * @param {Date} date
 */
function getMonday(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - days[date.getDay()],
  )
}

describe('app', () => {
  it('simple eqaulity', () => {
    const date = getMonday(new Date(2024, 0, 1))
    console.log(date.toLocaleString())
    expect(date.getDay()).toEqual(1)
  })
})
