// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "PassScanApp",
    platforms: [
        .iOS(.v17)
    ],
    dependencies: [
        .package(url: "https://github.com/romanmazeev/MRZScanner", from: "1.2.0"),
        .package(url: "https://github.com/pointfreeco/swift-concurrency-extras", from: "1.3.0")
    ],
    targets: [
        .executableTarget(
            name: "PassScanApp",
            dependencies: [
                "MRZScanner",
                .product(name: "ConcurrencyExtras", package: "swift-concurrency-extras")
            ],
            path: "PassScanApp",
            exclude: [
                "Resources/Info.plist",
                "Resources/RuntimeIcons",
                "Info.plist"
            ],
            resources: [
                .process("Resources")
            ]
        )
    ]
)
