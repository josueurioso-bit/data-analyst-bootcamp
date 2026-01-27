/**
 * CSV Export Endpoint
 *
 * TEACHING MOMENT: This endpoint generates a CSV file from database records.
 * CSV (Comma-Separated Values) is a simple text format that Excel, Google Sheets,
 * and data analysis tools can all read.
 *
 * Format:
 * - First row is headers (column names)
 * - Each subsequent row is one record
 * - Values separated by commas
 * - Text with commas/quotes wrapped in quotes
 */

// Using CommonJS for simplicity (works with dynamic import too)
const { getAllAssessments } = require('./lib/db.js');

module.exports = async function handler(req, res) {
  // CORS headers - needed for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    console.log('[CSV Export] Starting export...');

    // Get all assessments from database
    const rows = await getAllAssessments();

    console.log(`[CSV Export] Found ${rows.length} assessments`);

    // Define CSV headers
    // TEACHING MOMENT: The order here must match your dashboard expectations
    const headers = [
      'session_id',
      'timestamp',
      'numeracy_score',
      'reading_score',
      'computer_score',
      'logic_score',
      'communication_score',
      'mindset_score',
      'readiness_level',
      'readiness_title'
    ];

    // Build CSV content
    const csvLines = [];

    // Add header row
    csvLines.push(headers.join(','));

    // Add data rows
    for (const row of rows) {
      const line = [
        row.session_id || '',
        row.timestamp || '',
        row.numeracy_score ?? '',
        row.reading_score ?? '',
        row.computer_score ?? '',
        row.logic_score ?? '',
        row.communication_score ?? '',
        row.mindset_score ?? '',
        row.readiness_level ?? '',
        // TEACHING MOMENT: Text fields need special handling
        // 1. Wrap in quotes if contains comma, quote, or newline
        // 2. Escape internal quotes by doubling them ("" instead of ")
        escapeCSVField(row.readiness_title || '')
      ].join(',');

      csvLines.push(line);
    }

    // Join all lines with newline character
    const csvContent = csvLines.join('\n');

    // Set response headers for file download
    // TEACHING MOMENT: These headers tell the browser to download as a file
    // instead of displaying in the browser window
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="assessments.csv"');

    console.log('[CSV Export] Export complete');
    return res.status(200).send(csvContent);

  } catch (error) {
    console.error('[CSV Export] Error:', error);
    return res.status(500).json({
      error: 'Failed to export CSV',
      message: error.message
    });
  }
};

/**
 * Escape a field for CSV format
 *
 * TEACHING MOMENT: CSV has specific rules for special characters:
 * - If field contains comma, quote, or newline, wrap entire field in quotes
 * - If field contains quotes, double them (escape)
 *
 * Examples:
 * - "Hello, World" → "\"Hello, World\""
 * - He said "Hi" → "\"He said \"\"Hi\"\"\""
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if field needs quoting
  const needsQuotes = stringValue.includes(',') ||
                      stringValue.includes('"') ||
                      stringValue.includes('\n') ||
                      stringValue.includes('\r');

  if (needsQuotes) {
    // Escape internal quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}
