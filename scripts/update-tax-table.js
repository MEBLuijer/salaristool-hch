// Script om de tax-lookup.ts file te updaten met volledige data
async function updateTaxTable() {
  try {
    console.log("Loading CSV data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-ib9nMWrulJvjSDTsg75VZSdlmvv20d.csv",
    )

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())

    console.log(`Processing ${lines.length - 1} rows...`)

    const taxData = []

    // Skip header, process all data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const columns = line.split(",")

        if (columns.length >= 2) {
          const grossSalary = Number.parseFloat(columns[0])
          const tax = Number.parseFloat(columns[1])

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          }
        }
      }
    }

    console.log(`Loaded ${taxData.length} tax entries`)
    console.log("Range:", {
      min: Math.min(...taxData.map((d) => d.grossSalary)),
      max: Math.max(...taxData.map((d) => d.grossSalary)),
    })

    // Show sample data
    console.log("First 5 entries:", taxData.slice(0, 5))
    console.log("Last 5 entries:", taxData.slice(-5))

    return taxData
  } catch (error) {
    console.error("Error loading tax data:", error)
    return []
  }
}

updateTaxTable()
