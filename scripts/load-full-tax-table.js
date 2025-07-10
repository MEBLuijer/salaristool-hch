// Script om de volledige loonheffingstabel te laden en te verwerken
async function loadFullTaxTable() {
  try {
    console.log("Loading complete tax table...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-ib9nMWrulJvjSDTsg75VZSdlmvv20d.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV loaded successfully")
    console.log("First 200 characters:", csvText.substring(0, 200))

    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    // Show header
    console.log("Header:", lines[0])

    // Process first few rows to understand structure
    console.log("\nFirst 5 data rows:")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      console.log(`Row ${i}:`, lines[i])
    }

    // Parse all data
    const taxData = []
    let errors = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const columns = line.split(",")

        if (columns.length >= 2) {
          const grossSalary = Number.parseFloat(columns[0])
          const tax = Number.parseFloat(columns[1])

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          } else {
            errors++
          }
        }
      }
    }

    console.log(`\nProcessed ${taxData.length} valid entries`)
    console.log(`Errors: ${errors}`)

    if (taxData.length > 0) {
      console.log("Salary range:", {
        min: Math.min(...taxData.map((d) => d.grossSalary)),
        max: Math.max(...taxData.map((d) => d.grossSalary)),
      })

      console.log("First 10 entries:", taxData.slice(0, 10))
      console.log("Last 10 entries:", taxData.slice(-10))
    }

    return taxData
  } catch (error) {
    console.error("Error loading tax table:", error)
    return null
  }
}

loadFullTaxTable()
