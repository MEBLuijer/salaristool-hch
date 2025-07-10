"use client"

import { useState, useEffect } from "react"
import { lookupTax } from "./tax-lookup"
import { Calculator, Car, Calendar, TrendingUp, Euro, Clock, Zap, Fuel, CheckCircle, AlertCircle } from "lucide-react"

export default function SalaryCalculator() {
  const [grossSalary, setGrossSalary] = useState<number>(0)
  const [workingHours, setWorkingHours] = useState<string>("fulltime")
  const [leaseAmount, setLeaseAmount] = useState<number[]>([600])
  const [buyExtraDays, setBuyExtraDays] = useState<boolean>(false)
  const [extraDays, setExtraDays] = useState<number>(0)
  const [hasLease, setHasLease] = useState<boolean>(false)
  const [carType, setCarType] = useState<string>("EV")
  const [carFiscalValue, setCarFiscalValue] = useState<number>(0)

  useEffect(() => {
    if (carType === "EV") {
      setLeaseAmount([700])
    } else {
      setLeaseAmount([600])
    }
  }, [carType])

  // Bereken percentage op basis van werkuren
  const getWorkingPercentage = () => {
    switch (workingHours) {
      case "80":
        return 0.8
      case "90":
        return 0.9
      default:
        return 1.0
    }
  }

  // Bereken bruto dagloon (maandsalaris / 21,75)
  const getDailyWage = () => {
    return grossSalary / 21.75
  }

  // Bereken maximaal aantal extra dagen
  const getMaxExtraDays = () => {
    switch (workingHours) {
      case "80":
        return 8 // 80% = 8 dagen
      case "90":
        return 9 // 90% = 9 dagen
      default:
        return 10 // 100% = 10 dagen
    }
  }

  // Bereken vrije dagen pot (altijd gebaseerd op werkuren)
  const getFreeDaysPot = () => {
    return getMaxExtraDays() * getDailyWage()
  }

  // Bereken lease voordeel
  const getLeaseBonus = () => {
    if (!hasLease) {
      return 600 // Standaard €600 als geen lease (was 300)
    } else {
      if (carType === "EV") {
        const maxLease = 1000
        return maxLease - leaseAmount[0] // EV: €1000 - gekozen bedrag
      } else {
        const maxLease = 900
        return maxLease - leaseAmount[0] // ICE: €900 - gekozen bedrag
      }
    }
  }

  // Bereken bijtelling voor lease auto
  const getBijtelling = () => {
    if (!hasLease || !carFiscalValue) return 0

    if (carType === "EV") {
      // Elektrische auto's 2025: 17% tot €30.000, daarboven 22%
      if (carFiscalValue <= 30000) {
        return (carFiscalValue * 0.17) / 12 // 17% per jaar, gedeeld door 12 maanden
      } else {
        const lowerPart = 30000 * 0.17 // 17% over eerste €30.000
        const upperPart = (carFiscalValue - 30000) * 0.22 // 22% over bedrag boven €30.000
        return (lowerPart + upperPart) / 12
      }
    } else {
      // Hybride/Benzine: 22% bijtelling
      return (carFiscalValue * 0.22) / 12 // 22% per jaar, gedeeld door 12 maanden
    }
  }

  // Bereken vrije dagen bonus (als niet gekocht)
  const getFreeDaysBonus = () => {
    if (buyExtraDays) {
      // Als je wel dagen koopt, krijg je de rest van de pot uitbetaald
      const maxDays = getMaxExtraDays()
      const unusedDays = maxDays - extraDays
      return (unusedDays * getDailyWage()) / 12
    } else {
      // Als je geen dagen koopt, krijg je de hele pot uitbetaald
      // Pot gedeeld door 12 maanden
      return getFreeDaysPot() / 12
    }
  }

  // Bereken bruto totaal (zonder bijtelling)
  const getTotalGross = () => {
    const basePercentage = getWorkingPercentage()
    const baseSalary = grossSalary * basePercentage
    const leaseBonus = getLeaseBonus()
    const freeDaysBonus = getFreeDaysBonus()

    return baseSalary + leaseBonus + freeDaysBonus
  }

  // Bereken loonheffing met echte tabel
  const getLoonheffing = () => {
    const totalGrossWithBijtelling = getTotalGrossWithBijtelling()
    return lookupTax(totalGrossWithBijtelling)
  }

  // Bereken totaal bruto inclusief bijtelling
  const getTotalGrossWithBijtelling = () => {
    return getTotalGross() + getBijtelling()
  }

  // Bereken netto salaris
  const getNetSalary = () => {
    const totalGross = getTotalGross()
    const loonheffing = getLoonheffing()
    const internetVergoeding = 45 // Netto internet vergoeding
    const thuiswerkVergoeding = 15 // Netto thuiswerk vergoeding

    return totalGross - loonheffing + internetVergoeding + thuiswerkVergoeding
  }

  // Bereken kosten van extra dagen per maand
  const getExtraDaysCost = () => {
    if (!buyExtraDays) return 0
    return (extraDays * getDailyWage()) / 12
  }

  const sliderStyle = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #4ECDC4;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #4ECDC4;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`

  return (
    <div className="min-h-screen bg-white py-8">
      <style dangerouslySetInnerHTML={{ __html: sliderStyle }} />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <img src="/hch-logo.jpg" alt="HCH Logo" className="h-16 mr-6" />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-hch-gray mb-2">Rekentool Arbeidsvoorwaarden</h1>
            <p className="text-hch-gray-light italic">Flexibiliteit in leasebudget en vrije dagen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Basis Gegevens */}
          <div className="bg-gradient-to-br from-white to-hch-teal/10 rounded-xl shadow-lg p-6 border-l-4 border-hch-teal">
            <div className="flex items-center mb-6">
              <div className="bg-hch-teal p-3 rounded-lg mr-4">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-hch-gray">Basis Gegevens</h2>
            </div>

            {/* Bruto Salaris */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-hch-gray mb-2 flex items-center">
                <Euro className="h-4 w-4 mr-2 text-hch-teal" />
                Bruto maandsalaris
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hch-gray">€</span>
                <input
                  type="text"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hch-teal focus:border-transparent transition-all text-sm"
                  placeholder="4000"
                />
              </div>
            </div>

            {/* Werkuren */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-hch-gray mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-hch-teal" />
                Werkuren per week
              </label>
              <select
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hch-teal focus:border-transparent transition-all text-sm"
              >
                <option value="fulltime">Fulltime (40 uur)</option>
                <option value="90">90% (36 uur)</option>
                <option value="80">80% (32 uur)</option>
              </select>
            </div>

            {/* Info box */}
            <div className="bg-gradient-to-r from-hch-teal/10 to-hch-teal-light/10 p-4 rounded-lg border border-hch-teal/20">
              <h4 className="text-sm font-semibold text-hch-gray mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-hch-teal" />
                Berekening basis
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-hch-gray-light">Percentage:</span>
                  <span className="text-sm font-medium text-hch-gray">{Math.round(getWorkingPercentage() * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-hch-gray-light">Dagloon:</span>
                  <span className="text-sm font-medium text-hch-gray">€{getDailyWage().toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-hch-teal/20 pt-2">
                  <span className="text-sm font-medium text-hch-gray">Basis salaris:</span>
                  <span className="text-sm font-bold text-hch-teal">
                    €{(grossSalary * getWorkingPercentage()).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lease Auto */}
          <div className="bg-gradient-to-br from-white to-hch-teal/10 rounded-xl shadow-lg p-6 border-l-4 border-hch-teal">
            <div className="flex items-center mb-6">
              <div className="bg-hch-teal p-3 rounded-lg mr-4">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-hch-gray">Lease Auto</h2>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="hasLease"
                checked={hasLease}
                onChange={(e) => setHasLease(e.target.checked)}
                className="mr-3 h-5 w-5 text-hch-teal focus:ring-hch-teal border-gray-300 rounded"
              />
              <label htmlFor="hasLease" className="text-sm font-medium text-hch-gray">
                Ik wil een lease auto
              </label>
            </div>

            {hasLease ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hch-gray mb-2">Type auto</label>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hch-teal focus:border-transparent transition-all text-sm"
                  >
                    <option value="EV">⚡ Elektrisch</option>
                    <option value="ICE">🔋 Hybride/Benzine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-hch-gray mb-2 flex items-center">
                    <Euro className="h-4 w-4 mr-2 text-hch-teal" />
                    Lease bedrag per maand: €{leaseAmount[0]}
                  </label>
                  <input
                    type="range"
                    min={carType === "EV" ? "700" : "600"}
                    max={carType === "EV" ? "1000" : "900"}
                    step="1"
                    value={leaseAmount[0]}
                    onChange={(e) => setLeaseAmount([Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #4ECDC4 0%, #4ECDC4 ${((leaseAmount[0] - (carType === "EV" ? 700 : 600)) / (carType === "EV" ? 300 : 300)) * 100}%, #e5e7eb ${((leaseAmount[0] - (carType === "EV" ? 700 : 600)) / (carType === "EV" ? 300 : 300)) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-hch-gray-light mt-1">
                    <span>€{carType === "EV" ? "700" : "600"}</span>
                    <span>€{carType === "EV" ? "1000" : "900"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-hch-gray mb-2 flex items-center">
                    <Euro className="h-4 w-4 mr-2 text-hch-teal" />
                    Fiscale waarde auto
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hch-gray">€</span>
                    <input
                      type="text"
                      value={carFiscalValue}
                      onChange={(e) => setCarFiscalValue(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hch-teal focus:border-transparent transition-all text-sm"
                      placeholder="25000"
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-gradient-to-r from-hch-teal/10 to-hch-teal-light/10 p-4 rounded-lg border border-hch-teal/20">
                  <h4 className="text-sm font-semibold text-hch-gray mb-3 flex items-center">
                    {carType === "EV" ? <Zap className="h-4 w-4 mr-2" /> : <Fuel className="h-4 w-4 mr-2" />}
                    Lease berekening
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-hch-gray-light">Budget max:</span>
                      <span className="text-sm font-medium text-hch-gray">€{carType === "EV" ? "1000" : "900"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-hch-gray-light">Voordeel:</span>
                      <span className="text-sm font-medium text-green-600">€{getLeaseBonus().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-hch-gray-light">Bijtelling:</span>
                      <span className="text-sm font-medium text-red-600">€{getBijtelling().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-hch-teal/20 pt-2">
                      <span className="text-sm text-hch-gray-light">Percentage:</span>
                      <span className="text-sm font-medium text-hch-gray">{carType === "EV" ? "17%/22%" : "22%"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Geen lease auto
                </h4>
                <p className="text-sm text-green-700 mb-2">Je krijgt extra bruto salaris.</p>
                <div className="text-base font-bold text-green-800 flex items-center">
                  <Euro className="h-5 w-5 mr-1" />
                  600 per maand
                </div>
              </div>
            )}
          </div>

          {/* Vrije Dagen */}
          <div className="bg-gradient-to-br from-white to-hch-teal/10 rounded-xl shadow-lg p-6 border-l-4 border-hch-teal">
            <div className="flex items-center mb-6">
              <div className="bg-hch-teal p-3 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-hch-gray">Vrije Dagen</h2>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="buyExtraDays"
                checked={buyExtraDays}
                onChange={(e) => setBuyExtraDays(e.target.checked)}
                className="mr-3 h-5 w-5 text-hch-teal focus:ring-hch-teal border-gray-300 rounded"
              />
              <label htmlFor="buyExtraDays" className="text-sm font-medium text-hch-gray">
                Ik wil extra vrije dagen kopen
              </label>
            </div>

            {buyExtraDays ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hch-gray mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-hch-teal" />
                    Aantal extra dagen: {extraDays} van {getMaxExtraDays()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={getMaxExtraDays()}
                    step="1"
                    value={extraDays}
                    onChange={(e) => setExtraDays(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #4ECDC4 0%, #4ECDC4 ${(extraDays / getMaxExtraDays()) * 100}%, #e5e7eb ${(extraDays / getMaxExtraDays()) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-hch-gray-light mt-1">
                    <span>0 dagen</span>
                    <span>{getMaxExtraDays()} dagen</span>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-gradient-to-r from-hch-teal/10 to-hch-teal-light/10 p-4 rounded-lg border border-hch-teal/20">
                  <h4 className="text-sm font-semibold text-hch-gray mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Dagen berekening
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-hch-gray-light">Pot totaal:</span>
                      <span className="text-sm font-medium text-hch-gray">€{getFreeDaysPot().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-hch-gray-light">Kosten/mnd:</span>
                      <span className="text-sm font-medium text-red-600">€{getExtraDaysCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-hch-teal/20 pt-2">
                      <span className="text-sm text-hch-gray-light">Uitbetaling/mnd:</span>
                      <span className="text-sm font-bold text-green-600">€{getFreeDaysBonus().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Geen extra dagen
                </h4>
                <p className="text-sm text-green-700 mb-3">Je krijgt de volledige vrije dagen pot uitbetaald.</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Pot per jaar:</span>
                    <span className="text-sm font-medium text-green-800">€{getFreeDaysPot().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-1">
                    <span className="text-sm font-medium text-green-700">Per maand:</span>
                    <span className="text-base font-bold text-green-800 flex items-center">
                      <Euro className="h-5 w-5 mr-1" />
                      {getFreeDaysBonus().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Berekening */}
          <div className="bg-gradient-to-br from-white to-hch-teal/10 rounded-xl shadow-lg p-6 border-l-4 border-hch-teal">
            <div className="flex items-center mb-6">
              <div className="bg-hch-teal p-3 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-hch-gray">Berekening</h2>
            </div>

            {/* Stap voor stap breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Basis salaris</span>
                <span className="font-medium text-sm">€{(grossSalary * getWorkingPercentage()).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Lease voordeel</span>
                <span className="font-medium text-sm text-green-600">+€{getLeaseBonus().toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Vrije dagen</span>
                <span className="font-medium text-sm text-green-600">+€{getFreeDaysBonus().toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-3 font-semibold border">
                <span className="text-sm text-hch-gray">Totaal bruto</span>
                <span className="text-sm text-hch-gray">€{getTotalGross().toFixed(2)}</span>
              </div>

              {hasLease && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-hch-gray">Bijtelling</span>
                    <span className="font-medium text-sm text-red-600">+€{getBijtelling().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-3 font-semibold border">
                    <span className="text-sm text-hch-gray">Bruto + bijtelling</span>
                    <span className="text-sm text-hch-gray">€{getTotalGrossWithBijtelling().toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Loonheffing</span>
                <span className="font-medium text-sm text-red-600">-€{getLoonheffing().toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Internetvergoeding</span>
                <span className="font-medium text-sm text-green-600">+€45.00</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-hch-gray">Thuiswerkvergoeding</span>
                <span className="font-medium text-sm text-green-600">+€15.00</span>
              </div>

              <div className="bg-gradient-to-r from-hch-teal to-hch-teal-dark p-4 rounded-xl text-white shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Netto salaris</span>
                  <span className="text-xl font-bold">€{getNetSalary().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Extra info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 flex items-center">
                <AlertCircle className="h-3 w-3 mr-2" />
                Berekening gebaseerd op Nederlandse loonheffingstabel 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
