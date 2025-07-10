// Script om de loonheffingstabel CSV te verwerken
async function processLoonheffingData() {
  try {
    console.log("Fetching loonheffing data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-ib9nMWrulJvjSDTsg75VZSdlmvv20d.csv",
    )
    const csvText = await response.text()

    console.log("CSV data fetched, first 500 characters:")
    console.log(csvText.substring(0, 500))

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    const header = lines[0]
    console.log("Header:", header)

    // Process data lines
    const taxData = []
    for (let i = 1; i < Math.min(lines.length, 20); i++) {
      // Show first 20 rows for inspection
      const line = lines[i].trim()
      if (line) {
        const columns = line.split(",")
        console.log(`Row ${i}:`, columns)

        // Assuming format: grossSalary, tax (we'll adjust based on actual format)
        if (columns.length >= 2) {
          const grossSalary = Number.parseFloat(columns[0])
          const tax = Number.parseFloat(columns[1])

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          }
        }
      }
    }

    console.log(`\nProcessed ${taxData.length} tax entries (showing first 20 rows)`)
    console.log("Sample data:", taxData.slice(0, 10))

    console.log(`\nTotal lines in CSV: ${lines.length - 1}`)
  } catch (error) {
    console.error("Error processing loonheffing data:", error)
  }
}

processLoonheffingData()
