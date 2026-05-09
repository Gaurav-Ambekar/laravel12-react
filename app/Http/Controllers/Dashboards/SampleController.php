<?php

namespace App\Http\Controllers\Dashboards;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SampleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard');
    }
}
