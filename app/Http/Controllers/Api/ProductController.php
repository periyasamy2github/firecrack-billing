<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /** Validation for one product, in the frontend's camelCase field names. */
    private function rules(bool $stockRequired): array
    {
        return [
            'code' => ['required', 'string', 'max:60'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:40'],
            'hsn' => ['nullable', 'string', 'max:20'],
            'unit' => ['required', 'string', 'max:40'],
            'mrp' => ['required', 'numeric', 'gt:0'],
            'rate' => ['required', 'numeric', 'gt:0'],
            'gstRate' => ['required', 'numeric', 'gte:0'],
            'stock' => [$stockRequired ? 'required' : 'nullable', 'integer', 'gte:0'],
            'lowStockThreshold' => ['required', 'integer', 'gte:0'],
        ];
    }

    /** GET /products — the catalogue for one counter (staff) or all/one counter (super admin). */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $scope = $request->query('scope');

        $products = Product::query()
            ->with('counter')
            ->when(!$user->isSuperAdmin(), fn ($query) => $query->where('counter_id', $user->counter_id))
            ->when($user->isSuperAdmin() && $scope && $scope !== 'all', fn ($query) => $query->where('counter_id', $scope))
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    /** saveProduct — add a product or edit it; the stock field saves along with the rest. */
    public function store(Request $request): ProductResource
    {
        $data = $request->validate($this->rules(stockRequired: false));
        $counterId = $this->resolveCounterId($request->user(), $request->integer('counterId') ?: null);
        $product = $this->upsert($counterId, $data);

        return new ProductResource($product);
    }

    /** deleteProduct — soft delete within the product's counter; bill lines keep their snapshot. */
    public function destroy(Request $request, string $code): JsonResponse
    {
        $counterId = $this->resolveCounterId($request->user(), $request->integer('counterId') ?: null);
        Product::where('counter_id', $counterId)->where('barcode', $code)->firstOrFail()->delete();

        return response()->json(['code' => $code]);
    }

    /** importProducts — bulk upsert into one counter; per-row errors are collected, not fatal. */
    public function import(Request $request): JsonResponse
    {
        $counterId = $this->resolveCounterId($request->user(), $request->integer('counterId') ?: null);
        $rows = $request->input('products', []);
        $created = 0;
        $updated = 0;
        $errors = [];
        $saved = [];

        foreach ($rows as $i => $row) {
            $validator = Validator::make(is_array($row) ? $row : [], $this->rules(stockRequired: true));

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $i + 1,
                    'code' => is_array($row) ? ($row['code'] ?? '') : '',
                    'message' => $validator->errors()->first(),
                ];

                continue;
            }

            $data = $validator->validated();
            $existed = Product::withTrashed()->where('counter_id', $counterId)->where('barcode', $data['code'])->exists();
            $saved[] = $this->upsert($counterId, $data);
            $existed ? $updated++ : $created++;
        }

        return response()->json([
            'products' => ProductResource::collection(collect($saved)),
            'created' => $created,
            'updated' => $updated,
            'skipped' => count($errors),
            'errors' => $errors,
        ]);
    }

    /** Staff work in their own counter; a Super Admin must say which counter the products belong to. */
    private function resolveCounterId(User $user, ?int $requested): int
    {
        if (! $user->isSuperAdmin()) {
            return $user->counter_id;
        }

        if (! $requested) {
            abort(response()->json(['message' => 'Choose a branch for these products.'], 422));
        }

        return $requested;
    }

    private function upsert(int $counterId, array $data): Product
    {
        $product = Product::withTrashed()->firstOrNew([
            'counter_id' => $counterId,
            'barcode' => $data['code'],
        ]);

        if ($product->trashed()) {
            $product->restore();
        }

        // Stock saves whenever the form sends it; a brand-new product without one starts at 0.
        if (isset($data['stock'])) {
            $product->stock = $data['stock'];
        } elseif (! $product->exists) {
            $product->stock = 0;
        }

        $product->fill([
            'name' => $data['name'],
            'category' => $data['category'],
            'hsn' => $data['hsn'] ?? '',
            'unit' => $data['unit'],
            'mrp' => $data['mrp'],
            'rate' => $data['rate'],
            'gst_rate' => $data['gstRate'],
            'reorder_level' => $data['lowStockThreshold'],
        ])->save();

        return $product;
    }
}
