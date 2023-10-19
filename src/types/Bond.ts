export default interface Bond {
  isin: string
  currency: string
  issueDate: Date
  maturityDate: Date
  coupon: number
  issuer: string
  hairCut: number
}