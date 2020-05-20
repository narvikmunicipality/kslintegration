function DateValidator() {
    return {
        isValid: (fromDate, toDate) => {
            if (fromDate === undefined && toDate === undefined) {
                return true
            } else if (fromDate === undefined || toDate === undefined ||
                fromDate.trim().length !== 20 || toDate.trim().length !== 20 ||
                isNaN(new Date(fromDate)) || isNaN(new Date(toDate)) ||
                new Date(fromDate) > new Date(toDate)) {
                return false
            }

            return true
        }
    }
}

module.exports = DateValidator