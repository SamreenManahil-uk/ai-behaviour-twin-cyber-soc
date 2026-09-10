namespace CyberSoc.Api.Contracts.Common;

/// <summary>A deterministically ordered page of public resources.</summary>
/// <param name="Items">Resources on this page.</param>
/// <param name="Page">One-based page number.</param>
/// <param name="PageSize">Maximum items per page.</param>
/// <param name="TotalItems">Total matching resources.</param>
/// <param name="TotalPages">Number of matching pages.</param>
public sealed record PageResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalItems, int TotalPages);
