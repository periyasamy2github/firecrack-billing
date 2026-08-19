import { useState } from 'react'
import { z } from 'zod'
import { Button, Card, TextField, Typography } from '@mui/material'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { useStoreScope } from '../../hooks/useStoreScope'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../hooks/useToast'
import styles from './Settings.module.css'

const SettingsSection = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <div className={styles.section}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="caption" className={styles.sectionDesc}>{desc}</Typography>
    {children}
  </div>
)

const positiveInteger = (message: string) => z.string().refine((v) => /^\d+$/.test(v) && Number(v) > 0, message)

const settingsSchema = z.object({
  name: z.string().trim().min(1, 'Shop name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  addressLine: z.string().trim().min(1, 'Address is required'),
  gstin: z.string().trim().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Enter a valid 15-character GSTIN'),
  invoicePrefix: z.string().trim().min(1, 'Prefix is required'),
  declaration: z.string(),
  nextInvoiceNumber: positiveInteger('Enter a valid invoice number'),
  seasonTarget: positiveInteger('Enter a valid season target'),
})

export const Settings = () => {
  const { shop, saveShop } = useStoreScope()
  const [form, setForm] = useState({
    name: shop.name,
    phone: shop.phone,
    addressLine: shop.addressLine,
    gstin: shop.gstin,
    invoicePrefix: shop.invoicePrefix,
    nextInvoiceNumber: String(shop.nextInvoiceNumber),
    declaration: shop.declaration,
    seasonTarget: String(shop.seasonTarget),
  })
  const { errors, validate, clearError } = useFormValidation(settingsSchema)
  const showToast = useToast()

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    clearError(key)
  }

  const handleSave = async () => {
    if (!validate(form)) return
    await saveShop({
      ...shop,
      name: form.name.trim(),
      phone: form.phone.trim(),
      addressLine: form.addressLine.trim(),
      gstin: form.gstin.trim(),
      invoicePrefix: form.invoicePrefix.trim(),
      nextInvoiceNumber: Number(form.nextInvoiceNumber),
      declaration: form.declaration,
      seasonTarget: Number(form.seasonTarget),
    })
    showToast('Settings saved')
  }

  return (
    <>
      <PageHeader
        title="Settings"
        crumb={shop.name}
        actions={<Button variant="contained" onClick={handleSave}>Save changes</Button>}
      />
      <PageContent>
        <Card>
          <SettingsSection title="Shop profile" desc="Printed on every invoice. Changing these does not alter bills already raised.">
            <div className={styles.fieldsGrid2}>
              <TextField label="Shop name" value={form.name} onChange={(e) => setField('name', e.target.value)} size="small" error={Boolean(errors.name)} helperText={errors.name || ' '} />
              <TextField label="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} size="small" error={Boolean(errors.phone)} helperText={errors.phone || ' '} />
              <TextField
                label="Address"
                value={form.addressLine}
                onChange={(e) => setField('addressLine', e.target.value)}
                size="small"
                className={styles.addressField}
                error={Boolean(errors.addressLine)}
                helperText={errors.addressLine || ' '}
              />
              <TextField label="GSTIN" value={form.gstin} onChange={(e) => setField('gstin', e.target.value.toUpperCase())} size="small" fullWidth error={Boolean(errors.gstin)} helperText={errors.gstin || `State ${shop.stateCode}`} />
            </div>
          </SettingsSection>

          <SettingsSection title="Invoice & numbering" desc="Printed on every invoice.">
            <div className={styles.numberGrid}>
              <TextField label="Prefix" value={form.invoicePrefix} onChange={(e) => setField('invoicePrefix', e.target.value)} size="small" error={Boolean(errors.invoicePrefix)} helperText={errors.invoicePrefix || ' '} />
              <TextField
                label="Next number"
                value={form.nextInvoiceNumber}
                onChange={(e) => setField('nextInvoiceNumber', e.target.value.replace(/\D/g, ''))}
                size="small"
                error={Boolean(errors.nextInvoiceNumber)}
                helperText={errors.nextInvoiceNumber || ' '}
              />
            </div>
            <TextField label="Declaration printed on invoice" value={form.declaration} onChange={(e) => setField('declaration', e.target.value)} size="small" fullWidth multiline minRows={2} />
          </SettingsSection>

          <SettingsSection title="Season target" desc="Shown on the Super Admin dashboard as season progress.">
            <div className={styles.targetField}>
              <TextField
                label="Season sales target (₹)"
                value={form.seasonTarget}
                onChange={(e) => setField('seasonTarget', e.target.value.replace(/\D/g, ''))}
                size="small"
                fullWidth
                error={Boolean(errors.seasonTarget)}
                helperText={errors.seasonTarget || ' '}
              />
            </div>
          </SettingsSection>
        </Card>
      </PageContent>

    </>
  )
}

export default Settings
