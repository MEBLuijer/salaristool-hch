// Script om de loonheffingstabel CSV te laden
async function loadLoonheffingData() {
  try {
    console.log("Loading loonheffing data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/loonheffing2025-I86ePTcxLtHKPeuvq4N4EHsPdsNyfs.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV loaded successfully")
    console.log("First 300 characters:", csvText.substring(0, 300))

    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    // Show header
    console.log("Header:", lines[0])

    // Show first few data rows
    console.log("\nFirst 5 data rows:")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      console.log(`Row ${i}:`, lines[i])
    }

    // Parse the data
    const taxData = []
    let errors = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Handle different possible separators (comma, semicolon)
        const columns = line.includes(";") ? line.split(";") : line.split(",")

        if (columns.length >= 2) {
          // Clean and parse numbers - handle European decimal format
          let grossSalary = columns[0].replace(",", ".").trim()
          let tax = columns[1].replace(",", ".").trim()

          grossSalary = Number.parseFloat(grossSalary)
          tax = Number.parseFloat(tax)

          if (!isNaN(grossSalary) && !isNaN(tax)) {
            taxData.push({ grossSalary, tax })
          } else {
            errors++
            if (errors <= 3) {
              console.log(`Parse error on line ${i}:`, line)
            }
          }
        }
      }
    }

    console.log(`\nParsed ${taxData.length} valid entries`)
    console.log(`Parse errors: ${errors}`)

    if (taxData.length > 0) {
      // Sort by salary to ensure correct order
      taxData.sort((a, b) => a.grossSalary - b.grossSalary)

      console.log("\nSalary range:")
      console.log("Min:", Math.min(...taxData.map((d) => d.grossSalary)))
      console.log("Max:", Math.max(...taxData.map((d) => d.grossSalary)))

      console.log("\nFirst 10 entries:")
      taxData.slice(0, 10).forEach((entry, i) => {
        console.log(`${i + 1}: €${entry.grossSalary} -> €${entry.tax}`)
      })

      console.log("\nLast 10 entries:")
      taxData.slice(-10).forEach((entry, i) => {
        console.log(`${taxData.length - 9 + i}: €${entry.grossSalary} -> €${entry.tax}`)
      })
    }

    return taxData
  } catch (error) {
    console.error("Error loading loonheffing data:", error)
    return []
  }
}

loadLoonheffingData()
