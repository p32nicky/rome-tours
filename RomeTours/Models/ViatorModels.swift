import Foundation
import CoreLocation

// MARK: - Product Search Request

struct ProductSearchRequest: Encodable {
    let filtering: Filtering
    let sorting: Sorting
    let pagination: Pagination
    let currency: String

    struct Filtering: Encodable {
        let destination: String
    }
    struct Sorting: Encodable {
        let sort: String
        let order: String
    }
    struct Pagination: Encodable {
        let start: Int
        let count: Int
    }
}

// MARK: - Product Search Response

struct ProductSearchResponse: Decodable {
    let products: [ViatorProduct]
    let totalCount: Int?
}

// MARK: - Product

struct ViatorProduct: Decodable, Identifiable {
    let productCode: String
    let title: String
    let description: String?
    let images: [ProductImage]?
    let pricing: Pricing?
    let reviews: Reviews?
    let productUrl: String?
    let location: LocationRef?
    let duration: Duration?
    let flags: [String]?
    let categories: [Category]?

    var id: String { productCode }

    // Injected after location resolution
    var coordinate: CLLocationCoordinate2D?

    var primaryImageURL: URL? {
        guard let variants = images?.first?.variants else { return nil }
        let sorted = variants.sorted { ($0.width ?? 0) > ($1.width ?? 0) }
        return sorted.first.flatMap { URL(string: $0.url) }
    }

    var fromPrice: Double? { pricing?.summary?.fromPrice }
    var rating: Double? { reviews?.combinedAverageRating }
    var totalReviews: Int? { reviews?.totalReviews }
    var hasFreeCancellation: Bool { flags?.contains("FREE_CANCELLATION") ?? false }
    var likelyToSellOut: Bool { flags?.contains("LIKELY_TO_SELL_OUT") ?? false }

    var affiliateBookingURL: URL? {
        guard var urlString = productUrl else { return nil }
        var components = URLComponents(string: urlString)
        var queryItems = components?.queryItems ?? []
        if !Config.affiliatePartnerId.isEmpty {
            queryItems.append(URLQueryItem(name: "pid", value: Config.affiliatePartnerId))
        }
        if !Config.affiliateCampaignId.isEmpty {
            queryItems.append(URLQueryItem(name: "mcid", value: Config.affiliateCampaignId))
        }
        components?.queryItems = queryItems.isEmpty ? nil : queryItems
        return components?.url
    }

    enum CodingKeys: String, CodingKey {
        case productCode, title, description, images, pricing, reviews
        case productUrl, location, duration, flags, categories
    }
}

struct ProductImage: Decodable {
    let variants: [ImageVariant]?
}

struct ImageVariant: Decodable {
    let url: String
    let width: Int?
    let height: Int?
}

struct Pricing: Decodable {
    let summary: PricingSummary?
}

struct PricingSummary: Decodable {
    let fromPrice: Double?
}

struct Reviews: Decodable {
    let combinedAverageRating: Double?
    let totalReviews: Int?
}

struct LocationRef: Decodable {
    let ref: String?
}

struct Duration: Decodable {
    let fixedDurationInMinutes: Int?
    let variableDurationFromMinutes: Int?
    let variableDurationToMinutes: Int?

    var displayString: String {
        if let fixed = fixedDurationInMinutes {
            return formatMinutes(fixed)
        }
        if let from = variableDurationFromMinutes, let to = variableDurationToMinutes {
            return "\(formatMinutes(from))–\(formatMinutes(to))"
        }
        return "Varies"
    }

    private func formatMinutes(_ mins: Int) -> String {
        if mins < 60 { return "\(mins) min" }
        let h = mins / 60
        let m = mins % 60
        return m == 0 ? "\(h)h" : "\(h)h \(m)m"
    }
}

struct Category: Decodable {
    let id: Int?
    let name: String?
}

// MARK: - Locations Bulk

struct LocationsBulkRequest: Encodable {
    let locations: [String]
}

struct LocationsBulkResponse: Decodable {
    let locations: [LocationDetail]?
}

struct LocationDetail: Decodable {
    let ref: String?
    let center: Center?

    struct Center: Decodable {
        let lat: Double?
        let lng: Double?
    }
}

// MARK: - Product Detail

struct ViatorProductDetail: Decodable {
    let productCode: String
    let title: String
    let description: String?
    let itinerary: Itinerary?
    let inclusions: [InclusionExclusion]?
    let exclusions: [InclusionExclusion]?
    let cancellationPolicy: CancellationPolicy?
    let bookingConfirmationSettings: BookingConfirmation?
    let tags: [Int]?
    let images: [ProductImage]?
    let pricing: Pricing?
    let reviews: Reviews?
    let productUrl: String?
    let duration: Duration?
    let flags: [String]?
}

struct Itinerary: Decodable {
    let itineraryType: String?
    let skipTheLine: Bool?
    let privateTour: Bool?
    let activityInfo: ActivityInfo?
    let days: [ItineraryDay]?
}

struct ActivityInfo: Decodable {
    let location: String?
    let duration: Duration?
    let startingLocation: String?
}

struct ItineraryDay: Decodable {
    let title: String?
    let dayNumber: Int?
    let items: [ItineraryItem]?
}

struct ItineraryItem: Decodable {
    let pointOfInterestLocation: PoiLocation?
    let duration: Duration?
    let passByWithoutStopping: Bool?
    let admissionIncluded: String?
    let description: String?
}

struct PoiLocation: Decodable {
    let location: LocationRef?
    let attractionId: Int?
    let name: String?
}

struct InclusionExclusion: Decodable {
    let otherDescription: String?
    let typeDescription: String?
}

struct CancellationPolicy: Decodable {
    let type: String?
    let description: String?
    let cancelIfBadWeather: Bool?
    let cancelIfInsufficientTravelers: Bool?
}

struct BookingConfirmation: Decodable {
    let confirmationType: String?
    let maxConfirmationHours: Int?
}
