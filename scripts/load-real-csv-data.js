// Script om de echte CSV data te laden en te tonen
async function loadRealCSVData() {
  try {
    console.log("Loading real CSV data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-ib9nMWrulJvjSDTsg75VZSdlmvv20d.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV loaded successfully")

    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    // Show header and first few rows
    console.log("Header:", lines[0])
    console.log("\nFirst 10 data rows:")
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      console.log(`Row ${i}:`, lines[i])
    }

    // Parse all data
    const taxData = []
    let parseErrors = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const columns = line.split(",")

        if (columns.length >= 2) {
          // Try to parse the numbers - handle different decimal separators
          let grossSalary = columns[0].replace(",", ".")
          let tax = columns[1].replace(",", ".")

          grossSalary = Number.parseFloat(grossSalary)
          tax = Number.parseFloat(tax)

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          } else {
            parseErrors++
            if (parseErrors <= 5) {
              console.log(`Parse error on line ${i}:`, line)
            }
          }
        }
      }
    }

    console.log(`\nSuccessfully parsed ${taxData.length} entries`)
    console.log(`Parse errors: ${parseErrors}`)

    if (taxData.length > 0) {
      console.log("\nData range:")
      console.log("Min salary:", Math.min(...taxData.map((d) => d.grossSalary)))
      console.log("Max salary:", Math.max(...taxData.map((d) => d.grossSalary)))

      console.log("\nFirst 10 parsed entries:")
      taxData.slice(0, 10).forEach((entry, i) => {
        console.log(`${i + 1}: €${entry.grossSalary} -> €${entry.tax}`)
      })

      console.log("\nLast 10 parsed entries:")
      taxData.slice(-10).forEach((entry, i) => {
        console.log(`${taxData.length - 9 + i}: €${entry.grossSalary} -> €${entry.tax}`)
      })

      // Generate the TypeScript array format
      console.log("\n=== TYPESCRIPT DATA (first 20 entries) ===")
      const tsEntries = taxData
        .slice(0, 20)
        .map((entry) => `  { grossSalary: ${entry.grossSalary}, tax: ${entry.tax} }`)
        .join(",\n")
      console.log(tsEntries)
    }

    return taxData
  } catch (error) {
    console.error("Error loading CSV:", error)
    return null
  }
}

loadRealCSVData()
