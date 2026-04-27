import SwiftUI

struct TourListView: View {
    @ObservedObject var viewModel: ToursViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.filteredTours) { tour in
                    TourRowView(tour: tour)
                        .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                        .onTapGesture {
                            let impact = UIImpactFeedbackGenerator(style: .light)
                            impact.impactOccurred()
                            dismiss()
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                                viewModel.selectTour(tour)
                            }
                        }
                }
            }
            .listStyle(.plain)
            .navigationTitle("Rome Tours")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }
}

// MARK: - Tour Row

struct TourRowView: View {
    let tour: ViatorProduct

    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail
            AsyncImage(url: tour.primaryImageURL) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().aspectRatio(contentMode: .fill)
                case .empty:
                    ProgressView()
                default:
                    Image(systemName: "building.columns")
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 10))

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(tour.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(2)

                HStack(spacing: 8) {
                    if let rating = tour.rating {
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundStyle(.yellow)
                            Text(String(format: "%.1f", rating))
                                .font(.caption.weight(.medium))
                        }
                    }
                    if let duration = tour.duration {
                        Text(duration.displayString)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                HStack(spacing: 4) {
                    if tour.hasFreeCancellation {
                        Text("Free cancel")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(.green)
                    }
                    if tour.likelyToSellOut {
                        Image(systemName: "flame.fill")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                    Spacer()
                    if let price = tour.fromPrice {
                        Text("From $\(Int(price))")
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(.accentColor)
                    }
                }
            }
        }
        .padding(12)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
    }
}
