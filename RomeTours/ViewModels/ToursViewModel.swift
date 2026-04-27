import Foundation
import CoreLocation
import MapKit
import Combine

@MainActor
final class ToursViewModel: ObservableObject {

    @Published var tours: [ViatorProduct] = []
    @Published var filteredTours: [ViatorProduct] = []
    @Published var selectedTour: ViatorProduct?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var searchText = ""
    @Published var selectedFilter: TourFilter = .all
    @Published var mapRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 41.9028, longitude: 12.4964),
        span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
    )

    private let service = ViatorService()
    private var cancellables = Set<AnyCancellable>()

    init() {
        setupFiltering()
    }

    // MARK: - Load

    func loadTours() async {
        isLoading = true
        errorMessage = nil
        do {
            tours = try await service.fetchToursWithCoordinates()
            applyFilters()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func refreshTours() async {
        await loadTours()
    }

    // MARK: - Filtering

    private func setupFiltering() {
        Publishers.CombineLatest($searchText, $selectedFilter)
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .sink { [weak self] _, _ in self?.applyFilters() }
            .store(in: &cancellables)
    }

    private func applyFilters() {
        var result = tours

        if !searchText.isEmpty {
            let q = searchText.lowercased()
            result = result.filter {
                $0.title.lowercased().contains(q) ||
                ($0.description?.lowercased().contains(q) ?? false)
            }
        }

        switch selectedFilter {
        case .all: break
        case .freeCancellation: result = result.filter { $0.hasFreeCancellation }
        case .likelyToSellOut: result = result.filter { $0.likelyToSellOut }
        case .topRated: result = result.filter { ($0.rating ?? 0) >= 4.5 }
        }

        filteredTours = result
    }

    // MARK: - Map Interaction

    func selectTour(_ tour: ViatorProduct) {
        selectedTour = tour
        if let coord = tour.coordinate {
            withAnimation {
                mapRegion = MKCoordinateRegion(
                    center: coord,
                    span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
                )
            }
        }
    }

    func clearSelection() {
        selectedTour = nil
    }
}

// MARK: - Filter

enum TourFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case freeCancellation = "Free Cancel"
    case likelyToSellOut = "Selling Fast"
    case topRated = "Top Rated"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .all: return "map"
        case .freeCancellation: return "arrow.uturn.backward.circle"
        case .likelyToSellOut: return "flame"
        case .topRated: return "star.fill"
        }
    }
}
