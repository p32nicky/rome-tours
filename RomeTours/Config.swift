import Foundation

enum Config {
    // MARK: - Replace these with your actual credentials
    static let apiKey = "YOUR_VIATOR_API_KEY"
    static let affiliatePartnerId = "YOUR_PARTNER_ID"       // pid param
    static let affiliateCampaignId = "YOUR_CAMPAIGN_ID"     // mcid param

    // MARK: - API
    static let baseURL = "https://api.viator.com/partner"
    static let romeDestId = 684
    static let currency = "USD"
    static let pageSize = 50
}
