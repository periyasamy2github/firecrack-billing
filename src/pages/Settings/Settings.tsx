import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, CircularProgress, TextField, Typography } from '@mui/material'
import { PageHeader } from '../../components/PageHeader'
import { PageContent } from '../../components/PageContent'
import { useSession } from '../../hooks/useSession'
import { useDispatch } from '../../redux/store'
import { saveShop } from '../../redux/shopSlice'
import { useToast } from '../../hooks/useToast'
import { errorMessage } from '../../utils/errorMessage'
import { PaymentTypesEditor } from './PaymentTypesEditor'
import styles from '../../css/pages/Settings.module.css'
import { usePageTitle } from '../../hooks/usePageTitle'

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
  address: z.string().trim().min(1, 'Address is required'),
  gstin: z.string().trim().refine((val) => val === '' || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val), 'Enter a valid 15-character GSTIN'),
  invoicePrefix: z.string().trim().min(1, 'Prefix is required'),
  declaration: z.string(),
  nextInvoiceNumber: positiveInteger('Enter a valid invoice number'),
  seasonTarget: positiveInteger('Enter a valid season target'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

type FieldChange = { target: { value: string } }

const digitsOnly = (event: FieldChange) => { event.target.value = event.target.value.replace(/\D/g, '') }
const forceUpperCase = (event: FieldChange) => { event.target.value = event.target.value.toUpperCase() }

export const Settings = () => {
  usePageTitle('Settings')
  const { shop } = useSession()
  const dispatch = useDispatch()
  const showToast = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: shop.name,
      phone: shop.phone,
      address: shop.address,
      gstin: shop.gstin,
      invoicePrefix: shop.invoicePrefix,
      nextInvoiceNumber: String(shop.nextInvoiceNumber),
      declaration: shop.declaration,
      seasonTarget: String(shop.seasonTarget),
    },
  })

  const handleSave = async (values: SettingsFormValues) => {
    try {
      await dispatch(saveShop({
        ...shop,
        name: values.name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        gstin: values.gstin.trim(),
        invoicePrefix: values.invoicePrefix.trim(),
        nextInvoiceNumber: Number(values.nextInvoiceNumber),
        declaration: values.declaration,
        seasonTarget: Number(values.seasonTarget),
      })).unwrap()
      showToast('Settings saved')
    } catch (err) {
      showToast(errorMessage(err, 'Could not save these settings'), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        crumb={shop.name}
        actions={
          <Button
            variant="contained"
            onClick={handleSubmit(handleSave)}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={14} /> : undefined}
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />
      <PageContent>
        <div className={styles.sectionsGrid}>
          <Card>
          <SettingsSection title="Shop profile" desc="Printed on every invoice. Changing these does not alter bills already raised.">
            <div className={styles.fieldsGrid2}>
              <TextField label="Shop name" {...register('name')} size="small" error={Boolean(errors.name)} helperText={errors.name?.message || ' '} />
              <TextField label="Phone" {...register('phone')} size="small" error={Boolean(errors.phone)} helperText={errors.phone?.message || ' '} />
              <TextField
                label="Address"
                {...register('address')}
                size="small"
                className={styles.addressField}
                error={Boolean(errors.address)}
                helperText={errors.address?.message || ' '}
              />
              <TextField label="GSTIN" {...register('gstin', { onChange: forceUpperCase })} size="small" fullWidth error={Boolean(errors.gstin)} helperText={errors.gstin?.message || ' '} />
            </div>
          </SettingsSection>
          </Card>

          <Card>
          <SettingsSection title="Invoice & numbering" desc="Printed on every invoice.">
            <div className={styles.numberGrid}>
              <TextField label="Prefix" {...register('invoicePrefix')} size="small" error={Boolean(errors.invoicePrefix)} helperText={errors.invoicePrefix?.message || ' '} />
              <TextField
                label="Next number"
                {...register('nextInvoiceNumber', { onChange: digitsOnly })}
                size="small"
                error={Boolean(errors.nextInvoiceNumber)}
                helperText={errors.nextInvoiceNumber?.message || ' '}
              />
            </div>
            <TextField label="Declaration printed on invoice" {...register('declaration')} size="small" fullWidth multiline minRows={4} />
          </SettingsSection>
          </Card>

          <Card>
          <SettingsSection title="Payment types" desc="Ways a customer can pay. Switched-off types disappear from the billing screen; Mixed lets one bill split across types. Saved as you edit — the Save button above is not needed.">
            <PaymentTypesEditor />
          </SettingsSection>
          </Card>

          <Card>
          <SettingsSection title="Season target" desc="Shown on the Super Admin dashboard as season progress.">
            <div className={styles.targetField}>
              <TextField
                label="Season sales target (₹)"
                {...register('seasonTarget', { onChange: digitsOnly })}
                size="small"
                fullWidth
                error={Boolean(errors.seasonTarget)}
                helperText={errors.seasonTarget?.message || ' '}
              />
            </div>
          </SettingsSection>
          </Card>
        </div>
      </PageContent>

    </>
  )
}

export default Settings
