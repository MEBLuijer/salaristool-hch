// Script om de volledige loonheffingstabel te genereren
async function generateTaxLookup() {
  try {
    console.log("Fetching complete loonheffing data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-ib9nMWrulJvjSDTsg75VZSdlmvv20d.csv",
    )
    const csvText = await response.text()

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Processing ${lines.length - 1} data rows...`)

    const taxData = []

    // Skip header row, process all data
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

    console.log(`Successfully processed ${taxData.length} tax entries`)
    console.log("Salary range:", {
      min: Math.min(...taxData.map((d) => d.grossSalary)),
      max: Math.max(...taxData.map((d) => d.grossSalary)),
    })

    // Generate TypeScript code
    const tsCode = `// Complete Nederlandse loonheffingstabel 2025 (maandelijks)
const taxTable = ${JSON.stringify(taxData, null, 2)}

export function lookupTax(grossSalary: number): number {
  // Voor salarissen onder de minimum waarde
  if (grossSalary < taxTable[0].grossSalary) {
    return 0
  }
  
  // Voor salarissen boven de maximum waarde, gebruik lineaire extrapolatie
  if (grossSalary > taxTable[taxTable.length - 1].grossSalary) {
    const lastTwo = taxTable.slice(-2)
    const slope = (lastTwo[1].tax - lastTwo[0].tax) / (lastTwo[1].grossSalary - lastTwo[0].grossSalary)
    const extraAmount = grossSalary - lastTwo[1].grossSalary
    return lastTwo[1].tax + (slope * extraAmount)
  }

  // Zoek de dichtstbijzijnde waarde in de tabel
  let closestEntry = taxTable[0]
  let minDifference = Math.abs(grossSalary - closestEntry.grossSalary)

  for (const entry of taxTable) {
    const difference = Math.abs(grossSalary - entry.grossSalary)
    if (difference < minDifference) {
      minDifference = difference
      closestEntry = entry
    }
  }

  return closestEntry.tax
}`

    console.log("Generated TypeScript code (first 1000 chars):")
    console.log(tsCode.substring(0, 1000) + "...")

    return tsCode
  } catch (error) {
    console.error("Error generating tax lookup:", error)
  }
}

generateTaxLookup()
