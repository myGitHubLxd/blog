import Foundation

// Read input
let p = Int(readLine()!)!
let q = Int(readLine()!)!

// Calculate minimum bit flips
func minimumBitFlips(_ p: Int, _ q: Int) -> Int {
    let xorResult = p ^ q
    return xorResult.nonzeroBitCount
}

// Output result
print(minimumBitFlips(p, q))