<?php

namespace Tests\Unit;

#use PHPUnit\Framework\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingRouteTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic unit test example.
     *
     * @return void
     */
    public function test_upload_success()
    {
        $response = $this->postJson('/api/listings/upload', [
            'csv_file' => new \Illuminate\Http\UploadedFile(resource_path('test-files/test-upload-success.csv'), 'test-upload.csv', null, null, true),
        ]);

        // This file although technically a success has errors in the rows which will lead
        // to data in the errors section but since a record was processed it's not a complete failure
        $response->assertStatus(200)
            ->assertJsonPath('data.errors.0.message', "Row #0 failed the listing field validations")
            ->assertJsonPath('data.errors.0.validations.price.0', "The price must be a number.")
            ->assertJsonPath('data.errors.0.validations.net_margin.0', "The net margin field is required.")
            ->assertJsonPath('data.errors.1.message', "Row #2 failed the listing field validations")
            ->assertJsonPath('data.errors.1.validations.price.0', "The price field is required.")
            ->assertJsonPath('data.errors.1.validations.net_margin.0', "The net margin field is required.")
            ->assertJsonPath('data.errors.2.message', "Row #3 failed the listing field validations")
            ->assertJsonPath('data.errors.2.validations.title.0', "The title field is required.");
    }

    public function test_upload_failed()
    {
        $response = $this->postJson('/api/listings/upload', [
            'csv_file' => new \Illuminate\Http\UploadedFile(resource_path('test-files/test-upload-failed.csv'), 'test-upload.csv', null, null, true),
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('data.errors.0.message', "Row #0 failed the listing field validations")
            ->assertJsonPath('data.errors.0.validations.price.0', "The price must be a number.")
            ->assertJsonPath('data.errors.0.validations.net_margin.0', "The net margin field is required.")
            ->assertJsonPath('data.errors.1.message', "Row #1 doesn't have enough columns")
            ->assertJsonPath('data.errors.2.message', "Row #2 failed the listing field validations")
            ->assertJsonPath('data.errors.2.validations.price.0', "The price field is required.")
            ->assertJsonPath('data.errors.2.validations.net_margin.0', "The net margin field is required.")
            ->assertJsonPath('data.errors.3.message', "Row #3 failed the listing field validations")
            ->assertJsonPath('data.errors.3.validations.title.0', "The title field is required.");

    }


    public function test_upload_file_validation_failed()
    {
        $response = $this->postJson('/api/listings/upload', [
            'csv_file' => new \Illuminate\Http\UploadedFile(resource_path('test-files/test-upload-image.jpg'), 'test-upload.jpg', null, null, true),
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('data.errors.csv_file', ["The csv file must be a file of type: csv, txt."]);
    }
}
