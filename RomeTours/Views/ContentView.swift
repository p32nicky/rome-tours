import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = ToursViewModel()

    var body: some View {
        ZStack {
            ToursMapView(viewModel: viewModel)

            // Loading overlay
            if viewModel.isLoading && viewModel.tours.isEmpty {
                LoadingOverlay()
            }

            // Error overlay
            if let error = viewModel.errorMessage, viewModel.tours.isEmpty {
                ErrorOverlay(message: error) {
                    Task { await viewModel.loadTours() }
                }
            }
        }
        .task {
            await viewModel.loadTours()
        }
    }
}

// MARK: - Loading Overlay

struct LoadingOverlay: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()
            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.4)
                Text("Loading Rome tours…")
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - Error Overlay

struct ErrorOverlay: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()
            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.orange)
                Text("Could not load tours")
                    .font(.title3.weight(.bold))
                Text(message)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                Button("Retry") {
                    retry()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
        }
    }
}
