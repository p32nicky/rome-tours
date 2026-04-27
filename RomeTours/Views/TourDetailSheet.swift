import SwiftUI
import SafariServices
import CoreLocation

struct TourDetailSheet: View {
    let tour: ViatorProduct
    @ObservedObject var viewModel: ToursViewModel
    @Environment(\.dismiss) var dismiss
    @State private var showSafari = false
    @State private var imageLoaded = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {

                // MARK: - Hero Image
                HeroImageView(url: tour.primaryImageURL, isLoaded: $imageLoaded)

                // MARK: - Content
                VStack(alignment: .leading, spacing: 16) {

                    // Title + Badges
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            if tour.hasFreeCancellation {
                                BadgeView(label: "Free cancel", color: .green, icon: "checkmark.circle.fill")
                            }
                            if tour.likelyToSellOut {
                                BadgeView(label: "Selling fast", color: .orange, icon: "flame.fill")
                            }
                        }

                        Text(tour.title)
                            .font(.title2.weight(.bold))
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    // Rating + Stats Row
                    HStack(spacing: 16) {
                        if let rating = tour.rating, let total = tour.totalReviews {
                            RatingView(rating: rating, total: total)
                        }
                        if let duration = tour.duration {
                            StatView(icon: "clock", value: duration.displayString)
                        }
                        Spacer()
                    }

                    Divider()

                    // Price + Book Button
                    HStack(alignment: .center) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("From")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            if let price = tour.fromPrice {
                                Text("$\(Int(price))")
                                    .font(.title.weight(.bold))
                                + Text(" / person")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            } else {
                                Text("See pricing")
                                    .font(.title3.weight(.bold))
                            }
                        }

                        Spacer()

                        BookButton {
                            let impact = UIImpactFeedbackGenerator(style: .medium)
                            impact.impactOccurred()
                            showSafari = true
                        }
                    }

                    Divider()

                    // Description
                    if let desc = tour.description, !desc.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionHeader(title: "About this tour")
                            Text(desc)
                                .font(.body)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }

                    // Categories
                    if let cats = tour.categories, !cats.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionHeader(title: "Categories")
                            FlowLayout(spacing: 6) {
                                ForEach(cats, id: \.id) { cat in
                                    if let name = cat.name {
                                        CategoryTag(name: name)
                                    }
                                }
                            }
                        }
                    }

                    // Location on map (mini)
                    if let coord = tour.coordinate {
                        VStack(alignment: .leading, spacing: 8) {
                            SectionHeader(title: "Location")
                            MiniMapView(coordinate: coord, title: tour.title)
                                .frame(height: 140)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }

                    // Share button
                    HStack {
                        Spacer()
                        if let url = tour.affiliateBookingURL {
                            ShareLink(item: url, subject: Text(tour.title),
                                      message: Text("Check out this tour in Rome!")) {
                                Label("Share tour", systemImage: "square.and.arrow.up")
                                    .font(.subheadline.weight(.medium))
                            }
                        }
                        Spacer()
                    }
                    .padding(.top, 8)
                }
                .padding()
            }
        }
        .ignoresSafeArea(edges: .top)
        .fullScreenCover(isPresented: $showSafari) {
            if let url = tour.affiliateBookingURL {
                SafariView(url: url)
                    .ignoresSafeArea()
            }
        }
    }
}

// MARK: - Hero Image

struct HeroImageView: View {
    let url: URL?
    @Binding var isLoaded: Bool

    var body: some View {
        GeometryReader { geo in
            ZStack {
                if let url {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geo.size.width, height: 240)
                                .clipped()
                                .onAppear { isLoaded = true }
                        case .failure:
                            PlaceholderHero()
                        case .empty:
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    PlaceholderHero()
                }
            }
        }
        .frame(height: 240)
    }
}

struct PlaceholderHero: View {
    var body: some View {
        ZStack {
            LinearGradient(colors: [.orange.opacity(0.3), .red.opacity(0.3)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Image(systemName: "building.columns.fill")
                .font(.system(size: 48))
                .foregroundStyle(.white.opacity(0.6))
        }
    }
}

// MARK: - Rating

struct RatingView: View {
    let rating: Double
    let total: Int

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundStyle(.yellow)
                .font(.caption)
            Text(String(format: "%.1f", rating))
                .font(.subheadline.weight(.semibold))
            Text("(\(total))")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

struct StatView: View {
    let icon: String
    let value: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .font(.caption)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Book Button

struct BookButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text("Book Now")
                    .font(.headline)
                Image(systemName: "arrow.right")
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(Color.accentColor, in: Capsule())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Badges

struct BadgeView: View {
    let label: String
    let color: Color
    let icon: String

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: icon)
            Text(label)
        }
        .font(.caption.weight(.semibold))
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(color.opacity(0.12), in: Capsule())
    }
}

struct CategoryTag: View {
    let name: String

    var body: some View {
        Text(name)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(Color(.secondarySystemBackground), in: Capsule())
    }
}

struct SectionHeader: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.headline)
            .foregroundStyle(.primary)
    }
}

// MARK: - Mini Map

struct MiniMapView: UIViewRepresentable {
    let coordinate: CLLocationCoordinate2D
    let title: String

    func makeUIView(context: Context) -> MKMapView {
        let map = MKMapView()
        map.isUserInteractionEnabled = false
        map.layer.cornerRadius = 12

        let region = MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )
        map.setRegion(region, animated: false)

        let pin = MKPointAnnotation()
        pin.coordinate = coordinate
        pin.title = title
        map.addAnnotation(pin)
        return map
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {}
}

// MARK: - Safari

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        return SFSafariViewController(url: url, configuration: config)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

// MARK: - Flow Layout (for tags)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 0
        var height: CGFloat = 0
        var x: CGFloat = 0
        var rowHeight: CGFloat = 0

        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > width {
                height += rowHeight + spacing
                x = 0
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: width, height: height + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX {
                y += rowHeight + spacing
                x = bounds.minX
                rowHeight = 0
            }
            view.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
