// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RomeTours",
    platforms: [.iOS(.v17)],
    targets: [
        .executableTarget(
            name: "RomeTours",
            path: "RomeTours"
        )
    ]
)
