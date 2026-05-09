'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COUNTRY_CODES = [
  { code: '+49', flag: 'DE' }, { code: '+1', flag: 'US' }, { code: '+44', flag: 'UK' },
  { code: '+33', flag: 'FR' }, { code: '+39', flag: 'IT' }, { code: '+34', flag: 'ES' },
  { code: '+41', flag: 'CH' }, { code: '+43', flag: 'AT' }, { code: '+31', flag: 'NL' },
  { code: '+45', flag: 'DK' }, { code: '+46', flag: 'SE' }, { code: '+47', flag: 'NO' },
];

export default function VerifyForm({ auditId, initialEmail, initialFirstName, initialLastName, initialPhone }: {
  auditId: string;
  initialEmail: string;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<'details' | 'code'>('details');
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [countryCode, setCountryCode] = useState(initialPhone.match(/^\+\d+/)?.[0] || '+49');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.replace(/^\+\d+/, '').trim());
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const fullPhone = `${countryCode}${phoneNumber.replace(/[\s-]/g, '')}`;

  async function sendCode() {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError('Please fill in all fields.'); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email.'); return; }
    if (!/^\d{6,15}$/.test(phoneNumber.replace(/[\s-]/g, ''))) { setError('Please enter a valid phone number.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, firstName, lastName, email, phone: fullPhone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send code');
      setStage('code');
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function checkCode() {
    setError(null);
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, phone: fullPhone, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verification failed');
      router.push(`/onboarding/shopify?audit_id=${auditId}`);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function resend() {
    setResending(true); setError(null);
    try {
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, firstName, lastName, email, phone: fullPhone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resend');
    } catch (e: any) { setError(e.message); }
    finally { setResending(false); }
  }

  if (stage === 'code') {
    return (
      <div>
        <p className="text-sm text-muted-strong mb-4">We sent a 6-digit code to <span className="text-white font-semibold">{fullPhone}</span>.</p>
        <label className="label">Verification code</label>
        <input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          className="input text-center text-2xl tracking-[0.6em] font-bold"
          placeholder="000000"
          autoFocus
        />
        {error && <div className="mt-3 text-sm text-critical">{error}</div>}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={checkCode} disabled={busy} className="btn-primary flex-1">
            {busy ? 'Verifying…' : 'Verify code'}
          </button>
          <button onClick={resend} disabled={resending} className="btn-secondary">
            {resending ? 'Resending…' : 'Resend code'}
          </button>
        </div>
        <button onClick={() => setStage('details')} className="mt-4 text-xs text-muted hover:text-white">
          ← Back to details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">First name</label>
          <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Last name</label>
          <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Work email</label>
        <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Phone number</label>
        <div className="flex gap-2">
          <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="input w-28 flex-shrink-0">
            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
          </select>
          <input
            type="tel"
            className="input flex-1"
            placeholder="170 1234567"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <div className="text-sm text-critical">{error}</div>}
      <button onClick={sendCode} disabled={busy} className="btn-primary w-full mt-4">
        {busy ? 'Sending…' : 'Send verification code'}
      </button>
    </div>
  );
}
