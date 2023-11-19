export default interface Bond {
  isin: string
  currency: string
  issueDate: Date
  maturityDate: Date
  price: number
  size: number
  side: string
  coupon: number
  issuer: string
  hairCut: number
}
