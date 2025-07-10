// Script om tax-lookup.ts te updaten met volledige CSV data
async function updateTaxLookupFile() {
  try {
    console.log("Loading CSV and updating tax-lookup.ts...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-I86ePTcxLtHKPeuvq4N4EHsPdsNyfs.csv",
    )

    const csvText = await response.text()
    const lines = csvText.split("\n").filter((line) => line.trim())

    console.log(`Processing ${lines.length - 1} data rows...`)

    const taxData = []

    // Skip header, process all data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const columns = line.includes(";") ? line.split(";") : line.split(",")

        if (columns.length >= 2) {
          let grossSalary = columns[0].replace(",", ".").trim()
          let tax = columns[1].replace(",", ".").trim()

          grossSalary = Number.parseFloat(grossSalary)
          tax = Number.parseFloat(tax)

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          }
        }
      }
    }

    // Sort by salary
    taxData.sort((a, b) => a.grossSalary - b.grossSalary)

    console.log(`Loaded ${taxData.length} tax entries`)
    console.log("Range:", {
      min: taxData[0]?.grossSalary || 0,
      max: taxData[taxData.length - 1]?.grossSalary || 0,
    })

    // Generate the complete TypeScript file content
    const fileContent = `// Complete Nederlandse loonheffingstabel 2025 (maandelijks)
const taxTable = ${JSON.stringify(taxData, null, 2)}

export function lookupTax(grossSalary: number): number {
  // Voor salarissen onder de minimum waarde
  if (grossSalary <= 0 || taxTable.length === 0) {
    return 0
  }

  if (grossSalary < taxTable[0].grossSalary) {
    return 0
  }

  // Voor salarissen boven de maximum waarde, gebruik lineaire extrapolatie
  if (grossSalary > taxTable[taxTable.length - 1].grossSalary) {
    if (taxTable.length < 2) {
      return taxTable[taxTable.length - 1].tax
    }

    const lastTwo = taxTable.slice(-2)
    const slope = (lastTwo[1].tax - lastTwo[0].tax) / (lastTwo[1].grossSalary - lastTwo[0].grossSalary)
    const extraAmount = grossSalary - lastTwo[1].grossSalary
    return lastTwo[1].tax + slope * extraAmount
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

    console.log("Generated tax-lookup.ts file content")
    console.log("File size:", fileContent.length, "characters")

    return fileContent
  } catch (error) {
    console.error("Error updating tax lookup:", error)
    return null
  }
}

updateTaxLookupFile()
