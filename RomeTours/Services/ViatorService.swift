import Foundation
import CoreLocation

@MainActor
final class ViatorService: ObservableObject {

    private let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        return URLSession(configuration: config)
    }()

    private var baseURL: URL { URL(string: Config.baseURL)! }

    // MARK: - Headers

    private var commonHeaders: [String: String] {
        [
            "exp-api-key": Config.apiKey,
            "Accept": "application/json;version=2.0",
            "Accept-Language": "en-US",
            "Content-Type": "application/json"
        ]
    }

    // MARK: - Search Products

    func searchProducts(start: Int = 1) async throws -> ProductSearchResponse {
        let url = baseURL.appendingPathComponent("products/search")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        commonHeaders.forEach { request.setValue($1, forHTTPHeaderField: $0) }

        let body = ProductSearchRequest(
            filtering: .init(destination: "\(Config.romeDestId)"),
            sorting: .init(sort: "TRAVELER_RATING", order: "DESCENDING"),
            pagination: .init(start: start, count: Config.pageSize),
            currency: Config.currency
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        return try JSONDecoder().decode(ProductSearchResponse.self, from: data)
    }

    // MARK: - Resolve Locations

    func resolveLocations(refs: [String]) async throws -> [String: CLLocationCoordinate2D] {
        guard !refs.isEmpty else { return [:] }

        let url = baseURL.appendingPathComponent("locations/bulk")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        commonHeaders.forEach { request.setValue($1, forHTTPHeaderField: $0) }

        let body = LocationsBulkRequest(locations: refs)
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        let result = try JSONDecoder().decode(LocationsBulkResponse.self, from: data)

        var map: [String: CLLocationCoordinate2D] = [:]
        result.locations?.forEach { loc in
            if let ref = loc.ref,
               let lat = loc.center?.lat,
               let lng = loc.center?.lng {
                map[ref] = CLLocationCoordinate2D(latitude: lat, longitude: lng)
            }
        }
        return map
    }

    // MARK: - Product Detail

    func fetchProductDetail(code: String) async throws -> ViatorProductDetail {
        let url = baseURL.appendingPathComponent("products/\(code)")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        commonHeaders.forEach { request.setValue($1, forHTTPHeaderField: $0) }

        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        return try JSONDecoder().decode(ViatorProductDetail.self, from: data)
    }

    // MARK: - Fetch All with Coordinates

    func fetchToursWithCoordinates() async throws -> [ViatorProduct] {
        let searchResult = try await searchProducts()
        var products = searchResult.products

        // Collect location refs
        let refs = products.compactMap { $0.location?.ref }
        let locationMap = try await resolveLocations(refs: refs)

        // Inject coordinates
        for i in products.indices {
            if let ref = products[i].location?.ref,
               let coord = locationMap[ref] {
                products[i].coordinate = coord
            }
        }

        return products.filter { $0.coordinate != nil }
    }

    // MARK: - Validation

    private func validateResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw ViatorError.invalidResponse
        }
        guard (200...299).contains(http.statusCode) else {
            throw ViatorError.httpError(http.statusCode)
        }
    }
}

// MARK: - Errors

enum ViatorError: LocalizedError {
    case invalidResponse
    case httpError(Int)
    case noData

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid server response"
        case .httpError(let code): return "Server error \(code)"
        case .noData: return "No data returned"
        }
    }
}
