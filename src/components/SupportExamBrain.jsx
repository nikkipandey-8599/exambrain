
import { useState } from 'react'

const UPI_ID = 'exambrain1@axl'
const MIN_AMOUNT = 100

export default function SupportExamBrain() {
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [copied, setCopied] = useState(false)

  const selectedAmount = customAmount
    ? Number(customAmount)
    : amount

  const copyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this UPI ID:', UPI_ID)
    }
  }

  const payNow = () => {
    if (
      !Number.isFinite(selectedAmount) ||
      selectedAmount < MIN_AMOUNT ||
      !Number.isInteger(selectedAmount)
    ) {
      alert('Minimum contribution is ₹100.')
      return
    }

    const url = new URL('upi://pay')
    url.searchParams.set('pa', UPI_ID)
    url.searchParams.set('pn', 'Nikki Arvind Pandey')
    url.searchParams.set('am', String(selectedAmount))
    url.searchParams.set('cu', 'INR')
    url.searchParams.set('tn', 'Support ExamBrain')

    window.location.href = url.toString()
  }

  return (
    <section
      id="support-exambrain"
      className="w-full max-w-3xl mx-auto my-10 px-4"
    >
      <div className="rounded-3xl border border-amber-200/70 bg-[#fffdf5] p-6 sm:p-9 text-center shadow-sm">
        <div className="text-4xl mb-3">❤️</div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 mb-2">
          A little support goes a long way
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#382313]">
          Support ExamBrain
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[#78634e] max-w-lg mx-auto">
          ExamBrain is built to make learning easier and more accessible.
          Your voluntary contribution helps us cover AI API,
          hosting and maintenance costs.
        </p>

        <div className="mt-7">
          <p className="font-semibold text-[#382313] mb-3">
            Choose your contribution
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[100, 200, 500].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value)
                  setCustomAmount('')
                }}
                className={`rounded-xl border py-3 font-bold transition ${
                  amount === value && !customAmount
                    ? 'bg-[#92400e] text-white border-[#92400e]'
                    : 'bg-white text-[#593719] border-amber-200 hover:border-amber-500'
                }`}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <div className="max-w-md mx-auto mt-4 text-left">
            <label
              htmlFor="custom-donation"
              className="block text-sm font-medium text-[#593719] mb-2"
            >
              Or enter another amount (₹100 minimum)
            </label>

            <input
              id="custom-donation"
              type="number"
              min="100"
              step="1"
              value={customAmount}
              onChange={event => setCustomAmount(event.target.value)}
              placeholder="Enter amount in ₹"
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-[#382313] outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <div className="mt-7 rounded-2xl bg-white border border-amber-100 p-5 max-w-md mx-auto">
          <p className="font-semibold text-[#382313] mb-1">
            Scan & Pay using any UPI app
          </p>

          <img
            src="/exambrain-upi-qr.jpeg"
            alt="ExamBrain UPI donation QR code"
            className="w-56 h-auto max-w-full mx-auto my-4 rounded-lg"
          />

          <p className="text-xs text-[#78634e]">
            UPI ID
          </p>

          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <span className="font-bold text-[#382313]">
              {UPI_ID}
            </span>

            <button
              type="button"
              onClick={copyUPI}
              className="text-sm font-semibold text-amber-800 underline"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-[#78634e] mt-3">
            Suggested payment: ₹{selectedAmount || 0}
          </p>
        </div>

        <button
          type="button"
          onClick={payNow}
          className="mt-6 w-full max-w-md rounded-xl bg-[#92400e] hover:bg-[#78350f] text-white font-bold py-4 px-6 transition"
        >
          Contribute ₹{selectedAmount || 0} ❤️
        </button>

        <p className="text-xs text-[#927e69] mt-4">
          Contributions are completely voluntary.
          International payment options are coming soon.
        </p>
      </div>
    </section>
  )
}
