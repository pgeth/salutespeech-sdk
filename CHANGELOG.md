# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-11

### Added
- Initial release of Sber Salut Speech SDK
- OAuth 2.0 authentication with automatic token management
- Text-to-speech synthesis with streaming support
- Support for multiple audio formats (wav16, pcm16, opus, alaw, g729)
- Support for multiple voices (May_24000, May_8000)
- SSML support for advanced speech synthesis
- Automatic retry logic with exponential backoff
- Comprehensive error handling (SberSalutError, SberSalutAuthError, SberSalutRateLimitError, SberSalutTimeoutError)
- TypeScript support with full type definitions
- Cross-platform support (Node.js, browsers, edge runtimes)
- Environment variable support for credentials
- Detailed documentation and usage examples

### Features
- **Authentication**: OAuth 2.0 with automatic token refresh
- **TTS**: Streaming text-to-speech synthesis
- **Rate Limits**: Respects Sber Salut API rate limits (5 for individuals, 10 for companies)
- **Error Handling**: Comprehensive error types for different failure scenarios
- **TypeScript**: Full TypeScript support with strict typing
- **Examples**: Multiple usage examples included

[1.0.0]: https://github.com/yourusername/sbersalut-sdk/releases/tag/v1.0.0
