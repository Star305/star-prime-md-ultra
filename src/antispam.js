const spamMap = new Map()

class AntiSpam {
    isFiltered(sender) {
        if (!spamMap.has(sender)) return false
        const last = spamMap.get(sender)
        return Date.now() - last < 5000
    }
    addFilter(sender) {
        spamMap.set(sender, Date.now())
        setTimeout(() => spamMap.delete(sender), 5000)
    }
}

module.exports = new AntiSpam()
