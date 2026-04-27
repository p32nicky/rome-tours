import SwiftUI
import MapKit

struct ToursMapView: View {
    @ObservedObject var viewModel: ToursViewModel
    @State private var showList = false

    var body: some View {
        ZStack(alignment: .bottom) {
            // MARK: - Map
            Map(coordinateRegion: $viewModel.mapRegion,
                showsUserLocation: true,
                annotationItems: viewModel.filteredTours) { tour in
                MapAnnotation(coordinate: tour.coordinate!) {
                    TourMapPin(
                        tour: tour,
                        isSelected: viewModel.selectedTour?.id == tour.id
                    ) {
                        let impact = UIImpactFeedbackGenerator(style: .medium)
                        impact.impactOccurred()
                        viewModel.selectTour(tour)
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .ignoresSafeArea()

            // MARK: - Top Controls
            VStack(spacing: 0) {
                HStack {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.secondary)
                        TextField("Search Rome tours…", text: $viewModel.searchText)
                            .submitLabel(.search)
                    }
                    .padding(10)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))

                    // List toggle
                    Button {
                        showList.toggle()
                    } label: {
                        Image(systemName: showList ? "map.fill" : "list.bullet")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.primary)
                            .frame(width: 44, height: 44)
                            .background(.regularMaterial, in: Circle())
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)

                // Filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(TourFilter.allCases) { filter in
                            FilterChip(filter: filter,
                                       isSelected: viewModel.selectedFilter == filter) {
                                let impact = UISelectionFeedbackGenerator()
                                impact.selectionChanged()
                                viewModel.selectedFilter = filter
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
            }

            Spacer()

            // MARK: - Tour Count Badge
            if !viewModel.isLoading && viewModel.selectedTour == nil {
                TourCountBadge(count: viewModel.filteredTours.count)
                    .padding(.bottom, 120)
            }
        }
        .sheet(isPresented: $showList) {
            TourListView(viewModel: viewModel)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
                .presentationBackgroundInteraction(.enabled)
        }
        .sheet(item: $viewModel.selectedTour) { tour in
            TourDetailSheet(tour: tour, viewModel: viewModel)
                .presentationDetents([.height(480), .large])
                .presentationDragIndicator(.visible)
                .presentationBackgroundInteraction(.enabled(upThrough: .height(480)))
                .presentationCornerRadius(24)
        }
    }
}

// MARK: - Map Pin

struct TourMapPin: View {
    let tour: ViatorProduct
    let isSelected: Bool
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor : .white)
                        .frame(width: isSelected ? 48 : 36, height: isSelected ? 48 : 36)
                        .shadow(color: .black.opacity(0.2), radius: 4, y: 2)

                    if let price = tour.fromPrice {
                        VStack(spacing: 0) {
                            Text("$\(Int(price))")
                                .font(.system(size: isSelected ? 11 : 9, weight: .bold))
                                .foregroundStyle(isSelected ? .white : .primary)
                        }
                    } else {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundStyle(isSelected ? .white : .accentColor)
                    }
                }

                // Pin tail
                Image(systemName: "triangle.fill")
                    .font(.system(size: 6))
                    .foregroundStyle(isSelected ? Color.accentColor : .white)
                    .rotationEffect(.degrees(180))
                    .offset(y: -3)
            }
        }
        .scaleEffect(isSelected ? 1.1 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isSelected)
        .buttonStyle(.plain)
    }
}

// MARK: - Filter Chip

struct FilterChip: View {
    let filter: TourFilter
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: filter.icon)
                    .font(.caption)
                Text(filter.rawValue)
                    .font(.caption.weight(.semibold))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(isSelected ? Color.accentColor : Color(.systemBackground).opacity(0.9))
            .foregroundStyle(isSelected ? .white : .primary)
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.1), radius: 2, y: 1)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Tour Count Badge

struct TourCountBadge: View {
    let count: Int

    var body: some View {
        Text("\(count) tours in Rome")
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(.regularMaterial, in: Capsule())
            .shadow(color: .black.opacity(0.1), radius: 4)
    }
}
