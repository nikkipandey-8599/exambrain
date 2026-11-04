
import { useState } from 'react'

const UPI_ID = 'exambrain1@axl'
const MIN_AMOUNT = 100

export default function SupportExamBrain() {
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [copied, setCopied] = useState(false)

  const selectedAmount = customAmount.trim()
    ? Number(customAmount)
    : amount

  const validAmount =
    Number.isFinite(selectedAmount) &&
    Number.isInteger(selectedAmount) &&
    selectedAmount >= MIN_AMOUNT

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
    if (!validAmount) {
      alert('Minimum contribution is ₹100.')
      return
    }

    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'Nikki Arvind Pandey',
      am: String(selectedAmount),
      cu: 'INR',
      tn: 'Support ExamBrain'
    })

    window.location.href = `upi://pay?${params.toString()}`
  }

  const styles = {
    section: {
      width: '100%',
      maxWidth: '480px',
      margin: '28px auto',
      padding: '0 16px',
      fontFamily: 'system-ui, sans-serif',
      color: 'var(--text-primary)'
    },
    card: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '22px',
      padding: '24px 18px',
      textAlign: 'center',
      boxShadow: '0 8px 28px var(--shadow)'
    },
    eyebrow: {
      color: 'var(--brand-500)',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1.8px',
      textTransform: 'uppercase',
      marginBottom: '8px'
    },
    heading: {
      fontSize: '25px',
      fontWeight: 800,
      margin: '0 0 9px',
      letterSpacing: '-0.7px'
    },
    description: {
      fontSize: '13px',
      lineHeight: 1.6,
      color: 'var(--text-secondary)',
      maxWidth: '340px',
      margin: '0 auto'
    },
    label: {
      fontSize: '13px',
      fontWeight: 700,
      marginBottom: '12px',
      display: 'block'
    },
    choices: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '9px',
      maxWidth: '320px',
      margin: '0 auto'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid var(--border-strong)',
      background: 'var(--input-bg)',
      color: 'var(--text-primary)',
      fontSize: '14px',
      outline: 'none',
      marginTop: '8px'
    },
    paymentBox: {
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '15px',
      marginTop: '20px'
    },
    qr: {
      width: '145px',
      height: '145px',
      objectFit: 'contain',
      display: 'block',
      margin: '13px auto',
      borderRadius: '10px'
    },
    payButton: {
      width: '100%',
      border: 'none',
      borderRadius: '12px',
      padding: '15px',
      marginTop: '17px',
      background: 'var(--brand-500)',
      color: '#fffdf2',
      fontSize: '15px',
      fontWeight: 750,
      cursor: 'pointer',
      boxShadow: '0 4px 14px var(--brand-glow)'
    }
  }

  return (
    <section id="support-exambrain" style={styles.section}>
      <div style={styles.card}>
        <div style={{ fontSize: '27px', marginBottom: '8px' }}>
          ❤️
        </div>

        <p style={styles.eyebrow}>
          A little support goes a long way
        </p>

        <h2 style={styles.heading}>
          Support ExamBrain
        </h2>

        <p style={styles.description}>
          ExamBrain is built to make learning easier and more accessible.
          Your voluntary contribution helps us cover AI API, hosting
          and maintenance costs.
        </p>

        <div style={{ marginTop: '23px' }}>
          <label style={styles.label}>
            Choose your contribution
          </label>

          <div style={styles.choices}>
            {[100, 200, 500].map(value => {
              const active = amount === value && !customAmount

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value)
                    setCustomAmount('')
                  }}
                  style={{
                    padding: '12px 5px',
                    borderRadius: '10px',
                    border: active
                      ? '1px solid var(--brand-500)'
                      : '1px solid var(--border-strong)',
                    background: active
                      ? 'var(--brand-500)'
                      : 'var(--bg)',
                    color: active ? '#fffdf2' : 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: 750,
                    cursor: 'pointer'
                  }}
                >
                  ₹{value}
                </button>
              )
            })}
          </div>

          <div style={{ textAlign: 'left', marginTop: '17px' }}>
            <label
              htmlFor="custom-donation"
              style={{ fontSize: '12px', fontWeight: 650 }}
            >
              Or enter another amount (₹100 minimum)
            </label>

            <input
              id="custom-donation"
              type="number"
              min="100"
              step="1"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="Enter amount in ₹"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.paymentBox}>
          <p style={{ fontSize: '13px', fontWeight: 750 }}>
            Scan & pay using any UPI app
          </p>

          <img
            src="/exambrain-upi-qr.jpeg"
            alt="ExamBrain UPI payment QR code"
            style={styles.qr}
          />

          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            UPI ID
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              marginTop: '5px',
              flexWrap: 'wrap'
            }}
          >
            <strong style={{ fontSize: '13px' }}>
              {UPI_ID}
            </strong>

            <button
              type="button"
              onClick={copyUPI}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--brand-500)',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={payNow}
          disabled={!validAmount}
          style={{
            ...styles.payButton,
            opacity: validAmount ? 1 : 0.5,
            cursor: validAmount ? 'pointer' : 'not-allowed'
          }}
        >
          Pay ₹{Number.isFinite(selectedAmount) ? selectedAmount : 0} with UPI →
        </button>

        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginTop: '13px'
          }}
        >
          Contributions are voluntary. International payment options
          are coming soon.
        </p>
      </div>
    </section>
  )
}
